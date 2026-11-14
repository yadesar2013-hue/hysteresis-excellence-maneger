/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { detecterDoublons, DuplicateGroup } from '../../utils/duplicates';
import { GitMerge, GitCommit, AlertTriangle, CheckCircle2, Link2, Unlink } from 'lucide-react';

interface DuplicateManagerProps {
  onSelectLaureat: (laureat: any) => void;
}

export const DuplicateManager: React.FC<DuplicateManagerProps> = ({ onSelectLaureat }) => {
  const { laureats, relierParcours, deleteLaureat, currentRole } = useApp();
  const canLink = currentRole === 'admin' || currentRole === 'manager';
  const canDelete = currentRole === 'admin';

  const groups = detecterDoublons(laureats);
  const multiExamGroups = groups.filter((g) => g.type === 'PARCOURS_MULTI_EXAMEN');
  const strictGroups = groups.filter((g) => g.type === 'STRICT_DOUBLON');
  const similarGroups = groups.filter((g) => g.type === 'SIMILAIRE_A_VERIFIER');

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#ED5312] uppercase tracking-wider">
            Contrôle & Qualité des Données
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mt-0.5">
          Gestion des Doublons & Trajectoires d’Excellence Scolaire
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Distinguez les doublons d'erreur technique des élèves d’exception récompensés à plusieurs examens nationaux (ex: BEPC puis BAC).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <span className="text-purple-700 font-bold block">Double distinctions détectées</span>
            <strong className="text-2xl font-mono text-purple-900">{multiExamGroups.length}</strong>
            <p className="text-[11px] text-purple-700 mt-0.5">Élèves primés à plusieurs examens</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <span className="text-red-700 font-bold block">Doublons stricts à fusionner</span>
            <strong className="text-2xl font-mono text-red-900">{strictGroups.length}</strong>
            <p className="text-[11px] text-red-700 mt-0.5">Même nom, examen et édition</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <span className="text-amber-700 font-bold block">Correspondances similaires</span>
            <strong className="text-2xl font-mono text-amber-900">{similarGroups.length}</strong>
            <p className="text-[11px] text-amber-700 mt-0.5">Orthographe ou commune proche</p>
          </div>
        </div>
      </div>

      {/* 1. Trajectoires d'excellence (ex: ADANLIN Orel Bérenger, ASSOUMA Madjida) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <GitCommit className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Trajectoires Multi-Examens Validées ({multiExamGroups.length} cas)
            </h3>
            <p className="text-xs text-slate-500">
              Ces bénéficiaires ont été récompensés lors de plusieurs éditions successives (ex: BEPC puis BAC). Leurs fiches peuvent être reliées.
            </p>
          </div>
        </div>

        {multiExamGroups.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">Aucune distinction multi-examens non traitée.</p>
        ) : (
          <div className="space-y-4">
            {multiExamGroups.map((g) => {
              const areAllLinked = g.items.every((item) =>
                g.items.some((other) => other.id !== item.id && (item.parcoursLiesIds || []).includes(other.id))
              );

              return (
                <div key={g.id} className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-purple-900 text-base">{g.cle}</span>
                      <p className="text-xs text-purple-700 mt-0.5">{g.explication}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {areAllLinked ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Parcours Relié & Unifié</span>
                        </span>
                      ) : canLink ? (
                        <button
                          onClick={() => {
                            if (g.items.length >= 2) {
                              relierParcours(g.items[0].id, g.items[1].id);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ED5312] text-white hover:bg-[#D64307] text-xs font-bold rounded-lg shadow-2xs transition-colors"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>Relier ces fiches en parcours d’excellence</span>
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Comparatif côte à côte */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {g.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onSelectLaureat(item)}
                        className="p-3 bg-white border border-purple-200/80 rounded-lg hover:border-purple-400 cursor-pointer transition-colors text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-900 font-bold rounded-md text-[10px]">
                            {item.examen} {item.edition}
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            Moyenne : {item.moyenne.toFixed(2)} ({item.rang})
                          </span>
                        </div>
                        <div className="text-slate-800 font-semibold">{item.etablissement}</div>
                        <div className="text-slate-500 text-[11px]">
                          Commune : {item.commune} · Série : {item.serie || 'N/A'} {item.mention ? `(${item.mention})` : ''}
                        </div>
                        {item.telephone && (
                          <div className="text-slate-500 text-[11px] font-mono">
                            Contact : {item.telephone}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Doublons Stricts (Erreurs de saisie ou d'importation) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Doublons Stricts à Arbitrer ({strictGroups.length} cas)
            </h3>
            <p className="text-xs text-slate-500">
              Fiches présentant le même nom, la même édition et le même examen.
            </p>
          </div>
        </div>

        {strictGroups.length === 0 ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Aucun doublon strict détecté. La base de données est propre et intègre.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {strictGroups.map((g) => (
              <div key={g.id} className="p-4 bg-red-50/60 border border-red-200 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <strong className="text-red-900 text-xs">{g.cle}</strong>
                  {canDelete && (
                    <button
                      onClick={() => deleteLaureat(g.items[1].id, true)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700"
                    >
                      Supprimer le doublon secondaire
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {g.items.map((item, idx) => (
                    <div key={item.id} className="p-3 bg-white rounded-lg border border-red-200 text-xs">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">
                        Fiche #{idx + 1} (ID : {item.id})
                      </span>
                      <div>{item.nom} {item.prenoms}</div>
                      <div>{item.etablissement} - Moyenne : {item.moyenne}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
