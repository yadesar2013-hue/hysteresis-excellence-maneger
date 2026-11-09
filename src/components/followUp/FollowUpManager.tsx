/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Laureat } from '../../types/laureat';
import {
  PhoneCall,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  School,
  Sparkles,
  MessageSquare,
  Search,
} from 'lucide-react';

interface FollowUpManagerProps {
  onSelectLaureat: (laureat: Laureat) => void;
}

export const FollowUpManager: React.FC<FollowUpManagerProps> = ({ onSelectLaureat }) => {
  const { laureats, updateLaureat, currentRole } = useApp();
  const [filterRelance, setFilterRelance] = useState<'all' | 'À relancer' | 'À jour' | 'Sans contact'>('À relancer');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<any>('À jour');
  const [newNote, setNewNote] = useState('');

  const filtered = laureats.filter((l) => {
    if (filterRelance !== 'all' && l.statutRelance !== filterRelance) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = `${l.nom} ${l.prenoms}`.toLowerCase().includes(q);
      const matchCommune = l.commune.toLowerCase().includes(q);
      const matchEtab = l.etablissement.toLowerCase().includes(q);
      if (!matchName && !matchCommune && !matchEtab) return false;
    }
    return true;
  });

  const aRelancerCount = laureats.filter((l) => l.statutRelance === 'À relancer').length;
  const aJourCount = laureats.filter((l) => l.statutRelance === 'À jour').length;
  const sansContactCount = laureats.filter((l) => l.statutRelance === 'Sans contact').length;

  const handleSaveFollowUp = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    updateLaureat(id, {
      statutRelance: newStatus,
      dateDernierContact: today,
      notesInternes: newNote ? `[${today}] : ${newNote}` : undefined,
    });
    setEditingId(null);
    setNewNote('');
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#ED5312] uppercase tracking-wider">
            Accompagnement & Pérennisation
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mt-0.5">
          Suivi Post-Lauréat & File « À Relancer »
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Assurez le contact régulier avec les lauréats, suivez leur parcours académique, leurs réussites et leurs besoins.
        </p>

        {/* Métriques de contact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <button
            onClick={() => setFilterRelance('À relancer')}
            className={`p-3 rounded-xl border text-left transition-all ${
              filterRelance === 'À relancer'
                ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-amber-800 font-bold">Dossiers à relancer</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <strong className="text-2xl font-mono text-amber-900 mt-1 block">
              {aRelancerCount}
            </strong>
            <span className="text-[11px] text-amber-700">Priorité de contact</span>
          </button>

          <button
            onClick={() => setFilterRelance('À jour')}
            className={`p-3 rounded-xl border text-left transition-all ${
              filterRelance === 'À jour'
                ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-emerald-800 font-bold">Contacts à jour</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <strong className="text-2xl font-mono text-emerald-900 mt-1 block">
              {aJourCount}
            </strong>
            <span className="text-[11px] text-emerald-700">Suivi actif</span>
          </button>

          <button
            onClick={() => setFilterRelance('Sans contact')}
            className={`p-3 rounded-xl border text-left transition-all ${
              filterRelance === 'Sans contact'
                ? 'bg-slate-100 border-slate-300 ring-1 ring-slate-300'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-bold">Sans contact récent</span>
              <PhoneCall className="w-4 h-4 text-slate-500" />
            </div>
            <strong className="text-2xl font-mono text-slate-900 mt-1 block">
              {sansContactCount}
            </strong>
            <span className="text-[11px] text-slate-500">Coordonnées à actualiser</span>
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrer la file par nom, commune, école..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          <strong className="text-slate-900 font-mono">{filtered.length}</strong> bénéficiaire(s) affiché(s)
        </div>
      </div>

      {/* Liste des fiches de suivi */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
            Aucun lauréat ne correspond à ces critères dans cette file.
          </div>
        ) : (
          filtered.map((laureat) => {
            const isEditingThis = editingId === laureat.id;

            return (
              <div
                key={laureat.id}
                className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 text-[#ED5312] flex items-center justify-center font-bold text-sm shrink-0">
                      {laureat.nom.charAt(0)}{laureat.prenoms.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectLaureat(laureat)}
                          className="font-bold text-sm text-slate-900 hover:text-[#ED5312] hover:underline text-left"
                        >
                          {laureat.nom} {laureat.prenoms}
                        </button>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 font-mono font-bold text-slate-700">
                          {laureat.examen} {laureat.edition}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {laureat.commune} · {laureat.etablissement} · Moyenne : <strong className="text-slate-700 font-mono">{laureat.moyenne.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        laureat.statutRelance === 'À relancer'
                          ? 'bg-amber-100 text-amber-900'
                          : laureat.statutRelance === 'À jour'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {laureat.statutRelance}
                    </span>

                    {currentRole !== 'partner' && !isEditingThis && (
                      <button
                        onClick={() => {
                          setEditingId(laureat.id);
                          setNewStatus(laureat.statutRelance);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold transition-colors"
                      >
                        Mettre à jour
                      </button>
                    )}
                  </div>
                </div>

                {/* Détails du suivi et téléphone */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Contact : <strong className="font-mono text-slate-900">{laureat.telephone || 'Non renseigné'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Dernier échange : <strong className="text-slate-900">{laureat.dateDernierContact || 'Inconnu'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Statut : <strong className="text-slate-900">{laureat.statutActuel} ({laureat.orientationStem === 'Oui' ? 'STEM' : 'Général'})</strong></span>
                  </div>
                </div>

                {/* Formulaire inline de mise à jour */}
                {isEditingThis && (
                  <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs animate-in fade-in">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <label className="block text-slate-700 font-semibold mb-1">
                          Nouveau statut de contact
                        </label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-200 rounded-md font-medium"
                        >
                          <option value="À jour">À jour (Contact établi)</option>
                          <option value="À relancer">À relancer (Tentative sans succès / RDV)</option>
                          <option value="Sans contact">Sans contact récent</option>
                          <option value="Traité">Traité</option>
                        </select>
                      </div>

                      <div className="flex-2">
                        <label className="block text-slate-700 font-semibold mb-1">
                          Note d'échange ou de visite
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Appel avec la mère, élève en classe de Terminale C, besoins en manuels..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-200 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 border border-slate-300 text-slate-600 rounded-md hover:bg-white"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => handleSaveFollowUp(laureat.id)}
                        className="px-4 py-1 bg-[#ED5312] text-white rounded-md font-semibold hover:bg-[#D64307]"
                      >
                        Enregistrer l'action
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
