/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Laureat } from '../../types/laureat';
import { useApp } from '../../context/AppContext';
import { calculerCompletude } from '../../utils/completude';
import {
  X,
  User,
  GraduationCap,
  Award,
  PhoneCall,
  Sparkles,
  HeartHandshake,
  History,
  FileText,
  Printer,
  Edit2,
  GitCommit,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Send,
} from 'lucide-react';

interface LaureateDetailModalProps {
  laureat: Laureat;
  onClose: () => void;
  onEdit: (laureat: Laureat) => void;
  onNavigateToLaureat?: (id: string) => void;
}

export const LaureateDetailModal: React.FC<LaureateDetailModalProps> = ({
  laureat,
  onClose,
  onEdit,
  onNavigateToLaureat,
}) => {
  const { currentRole, laureats, updateLaureat } = useApp();
  const [activeTab, setActiveTab] = useState<number>(1);
  const [newNote, setNewNote] = useState('');

  const isAnonymized = currentRole === 'partner';
  const completude = calculerCompletude(laureat);

  // Recherche des distinctions liées (parcours multi-examens)
  const linkedLaureats = (laureat.parcoursLiesIds || [])
    .map((id) => laureats.find((l) => l.id === id))
    .filter(Boolean) as Laureat[];

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const dateStr = new Date().toLocaleDateString('fr-FR');
    const updatedNotes = laureat.notesInternes
      ? `${laureat.notesInternes}\n[${dateStr} - ${currentRole}] : ${newNote}`
      : `[${dateStr} - ${currentRole}] : ${newNote}`;
    updateLaureat(laureat.id, { notesInternes: updatedNotes });
    setNewNote('');
  };

  const tabs = [
    { id: 1, label: '1. Profil Général', icon: User },
    { id: 2, label: '2. Parcours Scolaire', icon: GraduationCap },
    { id: 3, label: '3. Récompenses', icon: Award },
    { id: 4, label: '4. Suivi Post-Lauréat', icon: PhoneCall },
    { id: 5, label: "5. Digit'ELLES Club", icon: Sparkles },
    { id: 6, label: '6. Mentorat', icon: HeartHandshake },
    { id: 7, label: '7. Historique & Complétude', icon: History },
    { id: 8, label: '8. Notes & Documents', icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* En-tête de la fiche détaillée */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 sm:p-6 shrink-0 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Photo ou initiales stylisées */}
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#ED5312] to-amber-500 text-white flex items-center justify-center text-2xl font-black shadow-md border-2 border-white/20 shrink-0">
                {laureat.photoUrl ? (
                  <img
                    src={laureat.photoUrl}
                    alt={laureat.nom}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  `${laureat.nom.charAt(0)}${laureat.prenoms.charAt(0)}`
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-sm bg-[#ED5312] text-white text-[10px] font-bold uppercase tracking-wider">
                    Édition {laureat.edition}
                  </span>
                  <span className="px-2 py-0.5 rounded-sm bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                    {laureat.examen}
                  </span>
                  <span className="text-white/60 text-xs">·</span>
                  <span className="text-xs text-white/80 font-medium">
                    {laureat.commune} ({laureat.departement})
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 text-white">
                  {isAnonymized ? `${laureat.nom.charAt(0)}*** ${laureat.prenoms.charAt(0)}***` : `${laureat.nom} ${laureat.prenoms}`}
                </h2>

                <div className="flex items-center gap-2 mt-1 text-xs text-white/70">
                  <span>{laureat.etablissement}</span>
                  <span>·</span>
                  <span className="font-semibold text-amber-300">
                    Moyenne : {laureat.moyenne.toFixed(2)} ({laureat.rang})
                  </span>
                </div>
              </div>
            </div>

            {/* Actions d'en-tête */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                title="Imprimer cette fiche individuelle"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimer</span>
              </button>

              {currentRole !== 'partner' && (
                <button
                  onClick={() => onEdit(laureat)}
                  className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                  title="Modifier les données de ce lauréat"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Modifier</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Jauge de Complétude & Alerte Parcours Multi-Distinctions */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-white/70">Complétude du dossier :</span>
              <div className="w-32 bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    completude.score >= 90
                      ? 'bg-emerald-400'
                      : completude.score >= 70
                      ? 'bg-amber-400'
                      : 'bg-red-400'
                  }`}
                  style={{ width: `${completude.score}%` }}
                />
              </div>
              <strong className="text-white font-mono">{completude.score}%</strong>
            </div>

            {linkedLaureats.length > 0 && (
              <div className="flex items-center gap-2 bg-purple-500/30 px-3 py-1 rounded-lg text-purple-200 border border-purple-400/40">
                <GitCommit className="w-3.5 h-3.5 text-purple-300" />
                <span>Double distinction liée :</span>
                {linkedLaureats.map((linked) => (
                  <button
                    key={linked.id}
                    onClick={() => onNavigateToLaureat?.(linked.id)}
                    className="underline font-bold text-white hover:text-purple-100"
                  >
                    {linked.examen} {linked.edition} ({linked.moyenne.toFixed(2)})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Barre d'onglets */}
        <div className="border-b border-slate-200 bg-slate-50 px-4 flex gap-1 overflow-x-auto shrink-0 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
                  isTabActive
                    ? 'border-[#ED5312] text-[#ED5312] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isTabActive ? 'text-[#ED5312]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contenu de l'onglet actif défilable */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* ONGLET 1 : PROFIL GÉNÉRAL */}
          {activeTab === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#ED5312]">
                  État Civil & Identification
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Nom de famille :</span>
                    <strong className="text-slate-900">{isAnonymized ? '***' : laureat.nom}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Prénoms :</span>
                    <strong className="text-slate-900">{isAnonymized ? '***' : laureat.prenoms}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Sexe :</span>
                    <strong className="text-slate-900">
                      {laureat.sexe === 'F' ? 'Féminin (Fille)' : 'Masculin (Garçon)'}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Date de naissance :</span>
                    <span className="font-mono text-slate-800">
                      {isAnonymized ? 'Confidentiel' : (laureat.dateNaissance || 'Non renseignée')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Lieu de naissance :</span>
                    <span className="text-slate-800">{laureat.lieuNaissance || 'Non renseigné'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Numéro d’ordre d'origine :</span>
                    <span className="font-mono text-slate-800">#{laureat.numeroOrigine || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#ED5312]">
                  Coordonnées & Personnes Référentes
                </h4>
                {isAnonymized ? (
                  <p className="text-slate-500 italic p-3 bg-white rounded-lg border border-slate-200">
                    Les coordonnées téléphoniques et e-mails sont masqués en mode partenaire pour protéger la vie privée des bénéficiaires.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Téléphone principal :</span>
                      <strong className="font-mono text-slate-900">
                        {laureat.telephone ? `${laureat.telephone} (${laureat.telephoneLibelle || 'Principal'})` : 'Non renseigné'}
                      </strong>
                    </div>
                    {laureat.contactsSecondaires && laureat.contactsSecondaires.length > 0 && (
                      <div className="py-1 border-b border-slate-200/60">
                        <span className="text-slate-500 block mb-1">Contacts secondaires :</span>
                        <div className="space-y-1">
                          {laureat.contactsSecondaires.map((c, i) => (
                            <div key={i} className="flex justify-between text-[11px] bg-white p-1.5 rounded-md border border-slate-200">
                              <span className="text-slate-600">{c.type} :</span>
                              <span className="font-mono font-medium">{c.numero}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Adresse e-mail :</span>
                      <span className="text-slate-800">{laureat.email || 'Non renseignée'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Consentement données :</span>
                      <span className="text-emerald-700 font-medium">Validé par le représentant</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ONGLET 2 : PARCOURS SCOLAIRE */}
          {activeTab === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#ED5312]">
                  Examen National & Établissement
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Édition primée :</span>
                    <strong className="text-slate-900 font-mono">{laureat.edition}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Niveau d’examen :</span>
                    <strong className="text-slate-900">{laureat.examen}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Établissement scolaire :</span>
                    <strong className="text-slate-900 text-right">{laureat.etablissement}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Statut établissement :</span>
                    <span className="text-slate-800">{laureat.typeEtablissement}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Commune représentée :</span>
                    <strong className="text-slate-900">{laureat.commune}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Département :</span>
                    <span className="text-slate-800">{laureat.departement}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#ED5312]">
                  Performance & Mentions
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Moyenne générale :</span>
                    <strong className="font-mono text-base text-[#ED5312]">{laureat.moyenne.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Classement / Rang :</span>
                    <span className="text-slate-900 font-semibold">{laureat.rang}</span>
                  </div>
                  {laureat.serie && (
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Série du BAC :</span>
                      <strong className="text-slate-900">{laureat.serie}</strong>
                    </div>
                  )}
                  {laureat.mention && (
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Mention officielle :</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold">
                        {laureat.mention}
                      </span>
                    </div>
                  )}
                  {laureat.moyenneEntreeSixieme && (
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Moyenne d'entrée en 6ème :</span>
                      <span className="font-mono font-bold text-slate-900">{laureat.moyenneEntreeSixieme}</span>
                    </div>
                  )}
                  {laureat.numeroTable && (
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Numéro de table :</span>
                      <span className="font-mono text-slate-800">{laureat.numeroTable}</span>
                    </div>
                  )}
                  {laureat.remarquesScolaires && (
                    <div className="py-1">
                      <span className="text-slate-500 block mb-0.5">Observations spécifiques :</span>
                      <p className="p-2 bg-white rounded-md border border-slate-200 text-slate-700 italic">
                        {laureat.remarquesScolaires}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 3 : RÉCOMPENSES */}
          {activeTab === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-4 rounded-xl border ${laureat.ordinateurRecu ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <div className="flex items-center gap-2">
                    <Laptop className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold">Ordinateur portable</span>
                  </div>
                  <div className="mt-2 text-xs">
                    {laureat.ordinateurRecu ? 'Dotation remise avec succès' : 'Non attribué'}
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${laureat.tabletteRecue ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    <span className="font-bold">Tablette éducative</span>
                  </div>
                  <div className="mt-2 text-xs">
                    {laureat.tabletteRecue ? 'Dotation remise avec succès' : 'Non attribuée'}
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${laureat.bourseRecue ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <span className="font-bold">Bourse d’Excellence</span>
                  </div>
                  <div className="mt-2 text-xs">
                    {laureat.bourseRecue ? 'Bourse d’appui accordée' : 'Non attribuée'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#ED5312]">
                  Détails de la Cérémonie de Remise
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Nature du prix :</span>
                    <strong className="text-slate-900">{laureat.naturePrix || 'Kit complet de l excellence Hystérésis'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Lieu de remise :</span>
                    <span className="text-slate-800">{laureat.lieuRemise || 'Cérémonie officielle - Borgou'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Partenaire associé :</span>
                    <span className="text-slate-800">{laureat.partenaireAssocie || 'Fondation Hystérésis & Partenaires'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 4 : SUIVI POST-LAURÉAT */}
          {activeTab === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#ED5312]">
                  Statut Scolaire / Professionnel Actuel
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Statut actuel :</span>
                    <strong className="text-slate-900">{laureat.statutActuel}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Établissement actuel :</span>
                    <span className="text-slate-800">{laureat.etablissementActuel || 'Non renseigné'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Filière / Domaine :</span>
                    <span className="text-slate-800">{laureat.filiereActuelle || 'Non renseigné'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Orientation STEM :</span>
                    <strong className={laureat.orientationStem === 'Oui' ? 'text-emerald-700' : 'text-slate-800'}>
                      {laureat.orientationStem}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#ED5312]">
                  Statut de Relance & Actions
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Statut de relance :</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${laureat.statutRelance === 'À relancer' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                      {laureat.statutRelance}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Date du dernier contact :</span>
                    <span className="font-mono text-slate-800">{laureat.dateDernierContact || 'Aucun contact enregistré'}</span>
                  </div>
                  {laureat.motifRelance && (
                    <div className="py-1">
                      <span className="text-slate-500 block mb-0.5">Motif de relance :</span>
                      <p className="p-2 bg-white rounded-md border border-slate-200 text-slate-700">
                        {laureat.motifRelance}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 5 : DIGIT'ELLES CLUB */}
          {activeTab === 5 && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#ED5312]">
                Intégration au Programme Digit'ELLES Club
              </h4>
              {laureat.participationClub ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Membre active :</span>
                      <strong className="text-emerald-700">Oui</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Commune du Club :</span>
                      <strong className="text-slate-900">{laureat.clubCommune || laureat.commune}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Niveau dans le Club :</span>
                      <span className="font-semibold text-slate-900">{laureat.clubNiveau || 'Non précisé'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Rôle :</span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-bold">
                        {laureat.roleClub || 'Membre'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-800 block">Règles du Club :</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Chaque Digit’ELLES Club accueille au maximum 12 jeunes filles (3 en 3ᵉ, 3 en Seconde, 3 en Première, 3 en Terminale) pour favoriser la transmission intergénérationnelle et l’initiation au numérique.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white rounded-lg border border-slate-200 text-center space-y-2">
                  <p className="text-slate-600">Ce lauréat n’est actuellement pas rattaché à un Digit'ELLES Club.</p>
                  {laureat.sexe === 'F' && currentRole !== 'partner' && (
                    <button
                      onClick={() => {
                        updateLaureat(laureat.id, {
                          participationClub: true,
                          clubCommune: laureat.commune,
                          clubNiveau: '3ème',
                          roleClub: 'Membre',
                        });
                      }}
                      className="px-3 py-1.5 bg-[#ED5312] text-white rounded-md text-xs font-semibold hover:bg-[#D64307]"
                    >
                      Inscrire dans le Digit'ELLES Club de {laureat.commune}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ONGLET 6 : MENTORAT */}
          {activeTab === 6 && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#ED5312]">
                Accompagnement & Mentorat Spécialisé
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block mb-1">Mentor désigné :</span>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-semibold text-slate-900">
                    {laureat.mentorAttribue || 'Aucun mentor assigné pour le moment'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Dernière activité suivie :</span>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700">
                    {laureat.derniereActiviteSuivie || 'Séance inaugurale Journée de l Excellence'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 7 : HISTORIQUE & QUALITÉ DES DONNÉES */}
          {activeTab === 7 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#ED5312] mb-2">
                  Contrôle de Qualité de la Fiche
                </h4>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold font-mono text-slate-900">
                    {completude.score}%
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${completude.statut === 'Complet' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    Dossier {completude.statut}
                  </span>
                </div>

                {completude.champsManquants.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-xs">
                    <strong>Champs obligatoires manquants :</strong> {completude.champsManquants.join(', ')}
                  </div>
                )}

                {completude.champsAcompleter.length > 0 && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
                    <strong>Informations complémentaires recommandées :</strong> {completude.champsAcompleter.join(', ')}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date de création :</span>
                  <span className="font-mono text-slate-700">{laureat.dateCreation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dernière modification :</span>
                  <span className="font-mono text-slate-700">{laureat.dateModification}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source d'origine :</span>
                  <span className="text-slate-700">{laureat.sourceInformation}</span>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 8 : NOTES & DOCUMENTS */}
          {activeTab === 8 && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#ED5312]">
                  Notes Internes de Suivi
                </h4>
                {laureat.notesInternes ? (
                  <pre className="p-3 bg-white rounded-lg border border-slate-200 text-slate-800 text-xs font-sans whitespace-pre-wrap leading-relaxed">
                    {laureat.notesInternes}
                  </pre>
                ) : (
                  <p className="text-slate-500 italic">Aucune note enregistrée pour l’instant.</p>
                )}

                {currentRole !== 'partner' && (
                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="Ajouter une observation de suivi..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <button
                      onClick={handleAddNote}
                      className="px-3 py-2 bg-[#ED5312] text-white rounded-lg text-xs font-semibold hover:bg-[#D64307] flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pied de modal avec actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            Fiche ID : <span className="font-mono">{laureat.id}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
