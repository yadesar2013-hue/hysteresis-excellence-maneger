/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Laureat, ExamenType, SexeType } from '../../types/laureat';
import { useApp } from '../../context/AppContext';
import { COMMUNES_BORGOU, EXAMENS, SERIES_BAC, MENTIONS, STATUTS_ACTUELS, ROLES_DIGITELLES, NIVEAUX_CLUB } from '../../data/referentielsBorgou';
import { X, Save, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface LaureateFormModalProps {
  initialData?: Laureat | null;
  onClose: () => void;
  onSuccess: (laureat: Laureat) => void;
}

const DRAFT_KEY = 'hysteresis_laureat_form_draft';

export const LaureateFormModal: React.FC<LaureateFormModalProps> = ({
  initialData,
  onClose,
  onSuccess,
}) => {
  const { addLaureat, updateLaureat } = useApp();
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState<Partial<Laureat>>(() => {
    if (initialData) return { ...initialData };

    // Vérifier s'il y a un brouillon sauvegardé
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) return JSON.parse(draft);
    } catch {
      // ignore
    }

    return {
      nom: '',
      prenoms: '',
      sexe: 'F',
      edition: 2026,
      examen: 'BAC',
      commune: 'Nikki',
      departement: 'Borgou',
      etablissement: '',
      typeEtablissement: 'Public',
      moyenne: 16.0,
      rang: '1er',
      serie: 'Série D',
      mention: 'Bien',
      ordinateurRecu: true,
      tabletteRecue: false,
      bourseRecue: true,
      statutActuel: 'Élève',
      orientationStem: 'Oui',
      participationClub: false,
      statutRelance: 'À jour',
      statutFiche: 'Active',
      consentementDonnees: true,
      autorisationPublicationPhoto: true,
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successToast, setSuccessToast] = useState('');

  // Sauvegarde automatique du brouillon si création
  useEffect(() => {
    if (!isEditing) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    }
  }, [formData, isEditing]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.nom?.trim()) errs.nom = 'Le nom est obligatoire.';
    if (!formData.prenoms?.trim()) errs.prenoms = 'Les prénoms sont obligatoires.';
    if (!formData.sexe) errs.sexe = 'Le sexe est obligatoire.';
    if (!formData.edition) errs.edition = 'L’année d’édition est obligatoire.';
    if (!formData.examen) errs.examen = 'Le type d’examen est obligatoire.';
    if (!formData.etablissement?.trim()) errs.etablissement = 'L’établissement scolaire est obligatoire.';
    if (!formData.commune?.trim()) errs.commune = 'La commune est obligatoire.';
    if (!formData.departement?.trim()) errs.departement = 'Le département est obligatoire.';

    if (formData.moyenne !== undefined && (formData.moyenne < 0 || formData.moyenne > 20)) {
      errs.moyenne = 'La moyenne doit être comprise entre 0 et 20.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && initialData) {
      updateLaureat(initialData.id, formData);
      setSuccessToast('Fiche mise à jour avec succès !');
      setTimeout(() => {
        onSuccess({ ...initialData, ...formData } as Laureat);
      }, 700);
    } else {
      const created = addLaureat(formData as any);
      localStorage.removeItem(DRAFT_KEY);
      setSuccessToast('Nouveau lauréat enregistré avec succès !');
      setTimeout(() => {
        onSuccess(created);
      }, 700);
    }
  };

  // Bouton demandé : « Ajouter un lauréat à l'édition suivante »
  const handleNextEditionPreFill = () => {
    setFormData((prev) => ({
      ...prev,
      edition: (prev.edition || 2026) + 1,
      examen: prev.examen === 'CEP' ? 'BEPC' : prev.examen === 'BEPC' ? 'BAC' : 'BAC',
      nom: '',
      prenoms: '',
      moyenne: 16.5,
      rang: '1er',
      dateNaissance: '',
      telephone: '',
    }));
    setSuccessToast(`Champs pré-remplis pour l'édition ${(formData.edition || 2026) + 1} !`);
    setTimeout(() => setSuccessToast(''), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* En-tête formulaire */}
        <div className="bg-[#ED5312] text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold">
              {isEditing ? `Modifier la fiche : ${initialData?.nom} ${initialData?.prenoms}` : 'Ajouter un nouveau lauréat'}
            </h3>
            <p className="text-xs text-orange-100 mt-0.5">
              Fondation Hystérésis · Journée de l’Excellence en milieu scolaire
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Toast de succès */}
        {successToast && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Bouton d'action rapide : Ajouter à l'édition suivante */}
        <div className="bg-orange-50/70 border-b border-orange-100 px-5 py-2.5 flex items-center justify-between text-xs">
          <span className="text-slate-700">
            Besoin d’ajouter les lauréats de la promotion à venir ?
          </span>
          <button
            type="button"
            onClick={handleNextEditionPreFill}
            className="px-3 py-1 bg-white border border-orange-200 text-[#ED5312] hover:bg-orange-100 rounded-md font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ajouter à l’édition suivante</span>
          </button>
        </div>

        {/* Corps du formulaire */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* 1. Identification */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#ED5312] mb-3">
              1. Identification du Bénéficiaire
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: SANGA"
                  value={formData.nom || ''}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value.toUpperCase() })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
                />
                {errors.nom && <span className="text-red-500 text-[10px]">{errors.nom}</span>}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Prénom(s) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Gentille"
                  value={formData.prenoms || ''}
                  onChange={(e) => setFormData({ ...formData, prenoms: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
                />
                {errors.prenoms && <span className="text-red-500 text-[10px]">{errors.prenoms}</span>}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Sexe <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.sexe || 'F'}
                  onChange={(e) => setFormData({ ...formData, sexe: e.target.value as SexeType })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
                >
                  <option value="F">Féminin (Fille)</option>
                  <option value="M">Masculin (Garçon)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={formData.dateNaissance || ''}
                  onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Lieu de naissance
                </label>
                <input
                  type="text"
                  placeholder="Ex: Bembéréké, Parakou..."
                  value={formData.lieuNaissance || ''}
                  onChange={(e) => setFormData({ ...formData, lieuNaissance: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Téléphone principal
                </label>
                <input
                  type="text"
                  placeholder="Ex: 68206919 ou 0197826915"
                  value={formData.telephone || ''}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
                />
              </div>
            </div>
          </div>

          {/* 2. Scolarité au moment de la distinction */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#ED5312] mb-3">
              2. Informations Scolaires & Distinction
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Édition <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={2022}
                  max={2035}
                  required
                  value={formData.edition || 2026}
                  onChange={(e) => setFormData({ ...formData, edition: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Examen <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.examen || 'BAC'}
                  onChange={(e) => setFormData({ ...formData, examen: e.target.value as ExamenType })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
                >
                  {EXAMENS.map((ex) => (
                    <option key={ex} value={ex}>
                      {ex}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Commune (Borgou) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.commune || 'Nikki'}
                  onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
                >
                  {COMMUNES_BORGOU.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Établissement scolaire <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CPEG MONT CARMEL"
                  value={formData.etablissement || ''}
                  onChange={(e) => setFormData({ ...formData, etablissement: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
                />
                {errors.etablissement && <span className="text-red-500 text-[10px]">{errors.etablissement}</span>}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Type d’établissement
                </label>
                <select
                  value={formData.typeEtablissement || 'Public'}
                  onChange={(e) => setFormData({ ...formData, typeEtablissement: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
                >
                  <option value="Public">Public</option>
                  <option value="Privé">Privé</option>
                  <option value="Militaire">Militaire (ex: PMB)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Moyenne obtenue
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  max="20"
                  placeholder="Ex: 17.85"
                  value={formData.moyenne !== undefined ? formData.moyenne : ''}
                  onChange={(e) => setFormData({ ...formData, moyenne: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Rang / Distinction
                </label>
                <input
                  type="text"
                  placeholder="Ex: 1er, 1ère (fille)..."
                  value={formData.rang || ''}
                  onChange={(e) => setFormData({ ...formData, rang: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
                />
              </div>

              {formData.examen === 'BAC' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Série du BAC
                    </label>
                    <select
                      value={formData.serie || 'Série D'}
                      onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
                    >
                      {SERIES_BAC.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Mention
                    </label>
                    <select
                      value={formData.mention || 'Bien'}
                      onChange={(e) => setFormData({ ...formData, mention: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
                    >
                      {MENTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 3. Dotations & Récompenses */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#ED5312] mb-3">
              3. Dotations & Récompenses Reçues
            </h4>
            <div className="flex flex-wrap gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.ordinateurRecu || false}
                  onChange={(e) => setFormData({ ...formData, ordinateurRecu: e.target.checked })}
                  className="rounded-xs text-[#ED5312] focus:ring-[#ED5312]"
                />
                <span>Ordinateur portable reçu</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.tabletteRecue || false}
                  onChange={(e) => setFormData({ ...formData, tabletteRecue: e.target.checked })}
                  className="rounded-xs text-[#ED5312] focus:ring-[#ED5312]"
                />
                <span>Tablette éducative reçue</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.bourseRecue || false}
                  onChange={(e) => setFormData({ ...formData, bourseRecue: e.target.checked })}
                  className="rounded-xs text-[#ED5312] focus:ring-[#ED5312]"
                />
                <span>Bourse d’Excellence accordée</span>
              </label>
            </div>
          </div>

          {/* 4. Suivi & Digit'ELLES Club */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#ED5312] mb-3">
              4. Suivi Post-Lauréat & Digit’ELLES Club
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Statut actuel
                </label>
                <select
                  value={formData.statutActuel || 'Élève'}
                  onChange={(e) => setFormData({ ...formData, statutActuel: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
                >
                  {STATUTS_ACTUELS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Orientation STEM
                </label>
                <select
                  value={formData.orientationStem || 'Oui'}
                  onChange={(e) => setFormData({ ...formData, orientationStem: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
                >
                  <option value="Oui">Oui (Sciences/Tech)</option>
                  <option value="Non">Non</option>
                  <option value="Inconnue">Inconnue</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Statut de relance
                </label>
                <select
                  value={formData.statutRelance || 'À jour'}
                  onChange={(e) => setFormData({ ...formData, statutRelance: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
                >
                  <option value="À jour">À jour</option>
                  <option value="À relancer">À relancer</option>
                  <option value="Sans contact">Sans contact</option>
                  <option value="Traité">Traité</option>
                </select>
              </div>

              {formData.sexe === 'F' && (
                <div className="sm:col-span-3 bg-pink-50/60 p-3 rounded-xl border border-pink-100 flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-pink-900">
                    <input
                      type="checkbox"
                      checked={formData.participationClub || false}
                      onChange={(e) => setFormData({ ...formData, participationClub: e.target.checked })}
                      className="rounded-xs text-pink-600 focus:ring-pink-500"
                    />
                    <span>Inscrire au Digit'ELLES Club</span>
                  </label>

                  {formData.participationClub && (
                    <div className="flex items-center gap-2">
                      <select
                        value={formData.clubNiveau || '3ème'}
                        onChange={(e) => setFormData({ ...formData, clubNiveau: e.target.value as any })}
                        className="p-1.5 bg-white border border-pink-200 rounded-md text-xs font-medium text-slate-800"
                      >
                        {NIVEAUX_CLUB.map((n) => (
                          <option key={n} value={n}>
                            Niveau {n}
                          </option>
                        ))}
                      </select>

                      <select
                        value={formData.roleClub || 'Membre'}
                        onChange={(e) => setFormData({ ...formData, roleClub: e.target.value as any })}
                        className="p-1.5 bg-white border border-pink-200 rounded-md text-xs font-medium text-slate-800"
                      >
                        {ROLES_DIGITELLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-[#ED5312] hover:bg-[#D64307] text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Enregistrer les modifications' : 'Enregistrer le lauréat'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
