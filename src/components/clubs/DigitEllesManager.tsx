/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DigitEllesClub, Laureat, RoleClubType } from '../../types/laureat';
import { COMMUNES_BORGOU, ROLES_DIGITELLES, NIVEAUX_CLUB } from '../../data/referentielsBorgou';
import {
  Sparkles,
  AlertTriangle,
  Users,
  CheckCircle2,
  Plus,
  School,
  Phone,
  Code,
  Trophy,
  UserCheck,
  X,
} from 'lucide-react';

interface DigitEllesManagerProps {
  onSelectLaureat: (laureat: Laureat) => void;
}

export const DigitEllesManager: React.FC<DigitEllesManagerProps> = ({ onSelectLaureat }) => {
  const { clubs, laureats, updateLaureat, addClub, currentRole } = useApp();
  const [selectedClubId, setSelectedClubId] = useState<string>(clubs[0]?.id || '');
  const [showAddClubModal, setShowAddClubModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const selectedClub = clubs.find((c) => c.id === selectedClubId) || clubs[0];

  // Membres de ce club
  const clubMembers = laureats.filter(
    (l) => l.participationClub && (l.clubCommune || '').toLowerCase() === (selectedClub?.commune || '').toLowerCase()
  );

  // Quotas par niveau (Règle stricte : 3 par niveau, 12 au total)
  const membresParNiveau = {
    '3ème': clubMembers.filter((m) => m.clubNiveau === '3ème'),
    'Seconde': clubMembers.filter((m) => m.clubNiveau === 'Seconde'),
    'Première': clubMembers.filter((m) => m.clubNiveau === 'Première'),
    'Terminale': clubMembers.filter((m) => m.clubNiveau === 'Terminale'),
  };

  const isOverCapacity = clubMembers.length > 12;
  const isAnyLevelOverCapacity = Object.values(membresParNiveau).some((list) => list.length > 3);

  // Jeunes instructrices du club
  const jeunesInstructrices = clubMembers.filter((m) => m.roleClub === 'Jeune Instructrice');

  // Filles éligibles non encore inscrites
  const fillesDisponibles = laureats.filter(
    (l) => l.sexe === 'F' && !l.participationClub && l.commune === selectedClub?.commune
  );

  // Formulaire d'ajout de club
  const [newClubNom, setNewClubNom] = useState('');
  const [newClubCommune, setNewClubCommune] = useState('Nikki');
  const [newClubEtab, setNewClubEtab] = useState('');
  const [newClubResp, setNewClubResp] = useState('');
  const [newClubContact, setNewClubContact] = useState('');

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubNom || !newClubCommune) return;

    addClub({
      nom: newClubNom,
      commune: newClubCommune,
      etablissement: newClubEtab || `Établissement Pilote ${newClubCommune}`,
      anneeCreation: 2026,
      responsableNom: newClubResp || 'Responsable Pédagogique',
      responsableContact: newClubContact || '',
      capaciteMax: 12,
      maxParNiveau: 3,
      description: `Digit’ELLES Club de ${newClubCommune} pour le renforcement des compétences numériques des filles.`,
    });

    setShowAddClubModal(false);
    setNewClubNom('');
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#ED5312] uppercase tracking-wider">
              Programme d’Émancipation Féminine Numérique
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            Module Digit'ELLES Clubs (Quotas Stricts : Max 12 Filles par Club)
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Gouvernance et suivi des cohortes féminines : 3 filles en 3ᵉ, 3 en 2ⁿᵈᵉ, 3 en 1ʳᵉ et 3 en Tˡᵉ.
          </p>
        </div>

        {currentRole === 'admin' && (
          <button
            onClick={() => setShowAddClubModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#ED5312] hover:bg-[#D64307] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un nouveau club</span>
          </button>
        )}
      </div>

      {/* Sélecteur de Clubs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {clubs.map((c) => {
          const count = laureats.filter(
            (l) => l.participationClub && (l.clubCommune || '').toLowerCase() === c.commune.toLowerCase()
          ).length;
          const isSelected = selectedClub?.id === c.id;

          return (
            <button
              key={c.id}
              onClick={() => setSelectedClubId(c.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-pink-50/60 border-pink-400 shadow-xs ring-1 ring-pink-400'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 truncate">{c.nom}</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${count > 12 ? 'bg-red-100 text-red-700' : 'bg-pink-100 text-pink-700'}`}>
                  {count} / 12
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 truncate">
                Commune : {c.commune}
              </div>
            </button>
          );
        })}
      </div>

      {/* Détail du Club sélectionné & Tableau de bord Quotas */}
      {selectedClub && (
        <div className="space-y-5">
          {/* Alerte si dépassement de quota (Section 11 du cahier des charges) */}
          {(isOverCapacity || isAnyLevelOverCapacity) && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Alerte de conformité aux statuts Digit'ELLES Clubs :</strong>
                {isOverCapacity && (
                  <p className="mt-0.5">
                    · Ce club dépasse la capacité maximale statutaire de 12 membres ({clubMembers.length} inscrites).
                  </p>
                )}
                {isAnyLevelOverCapacity && (
                  <p className="mt-0.5">
                    · Un ou plusieurs niveaux scolaires dépassent le plafond de 3 filles (veuillez rééquilibrer la cohorte).
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Grille des 4 niveaux : 3ème, 2nde, 1ère, Terminale */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(['3ème', 'Seconde', 'Première', 'Terminale'] as const).map((niv) => {
              const list = membresParNiveau[niv];
              const isOverLevel = list.length > 3;

              return (
                <div
                  key={niv}
                  className={`bg-white rounded-xl p-4 border shadow-xs ${
                    isOverLevel ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-xs text-slate-800">Niveau {niv}</span>
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                        isOverLevel
                          ? 'bg-red-100 text-red-800'
                          : list.length === 3
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {list.length} / 3 filles
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {list.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-2">
                        Aucune fille inscrite à ce niveau.
                      </p>
                    ) : (
                      list.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => onSelectLaureat(m)}
                          className="p-2 bg-slate-50 hover:bg-orange-50 rounded-lg border border-slate-200/80 cursor-pointer text-xs space-y-1 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 truncate">
                              {m.nom} {m.prenoms}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>Moyenne : {m.moyenne.toFixed(2)}</span>
                            {m.roleClub && (
                              <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 font-bold rounded-xs">
                                {m.roleClub}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section Jeunes Instructrices & Projets */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#ED5312]" />
                  Jeunes Instructrices & Déléguées du Club ({jeunesInstructrices.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lauréates les plus avancées animant les ateliers pour leurs pairs.
                </p>
              </div>

              {currentRole !== 'partner' && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="px-3 py-1.5 bg-[#ED5312] text-white rounded-lg text-xs font-semibold hover:bg-[#D64307] transition-colors"
                >
                  Ajouter une lauréate au Club
                </button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {jeunesInstructrices.length === 0 ? (
                <p className="text-xs text-slate-400 italic col-span-3">
                  Aucune jeune instructrice n'est encore désignée dans ce club.
                </p>
              ) : (
                jeunesInstructrices.map((inst) => (
                  <div
                    key={inst.id}
                    onClick={() => onSelectLaureat(inst)}
                    className="p-3 bg-purple-50/60 border border-purple-200 rounded-lg cursor-pointer hover:border-purple-400 text-xs space-y-1 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-purple-950 font-bold">{inst.nom} {inst.prenoms}</strong>
                      <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-1.5 py-0.5 rounded-xs">
                        Instructrice
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Édition {inst.edition} · {inst.examen} (Moyenne : {inst.moyenne.toFixed(2)})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Établissement : {inst.etablissement}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Affectation Lauréate */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Inscrire une lauréate dans le {selectedClub?.nom}
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {fillesDisponibles.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  Toutes les lauréates de {selectedClub?.commune} sont déjà rattachées ou aucune fille n'est disponible.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {fillesDisponibles.map((f) => (
                    <div
                      key={f.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-slate-900">{f.nom} {f.prenoms}</strong>
                        <div className="text-[11px] text-slate-500">{f.examen} {f.edition} ({f.etablissement})</div>
                      </div>
                      <button
                        onClick={() => {
                          updateLaureat(f.id, {
                            participationClub: true,
                            clubCommune: selectedClub?.commune,
                            clubNiveau: '3ème',
                            roleClub: 'Membre',
                          });
                          setShowAssignModal(false);
                        }}
                        className="px-2.5 py-1 bg-[#ED5312] text-white rounded-md text-[11px] font-bold hover:bg-[#D64307]"
                      >
                        Inscrire
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Création Club */}
      {showAddClubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Créer un nouveau Digit'ELLES Club</h3>
              <button onClick={() => setShowAddClubModal(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClub} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nom du Club</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Digit'ELLES Club Kalalé"
                  value={newClubNom}
                  onChange={(e) => setNewClubNom(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Commune</label>
                <select
                  value={newClubCommune}
                  onChange={(e) => setNewClubCommune(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  {COMMUNES_BORGOU.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Établissement siège</label>
                <input
                  type="text"
                  placeholder="Ex: CEG 1 Kalalé"
                  value={newClubEtab}
                  onChange={(e) => setNewClubEtab(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Responsable référente</label>
                <input
                  type="text"
                  placeholder="Nom de la responsable pédagogique"
                  value={newClubResp}
                  onChange={(e) => setNewClubResp(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddClubModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#ED5312] text-white rounded-lg font-bold hover:bg-[#D64307]"
                >
                  Créer le club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
