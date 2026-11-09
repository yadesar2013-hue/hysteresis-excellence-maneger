/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ETABLISSEMENTS_INITIALS, COMMUNES_BORGOU, SERIES_BAC, EXAMENS, EtablissementRef } from '../../data/referentielsBorgou';
import { useApp } from '../../context/AppContext';
import { BookOpen, Plus, School, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export const ReferentielsView: React.FC = () => {
  const { laureats } = useApp();
  const [etablissements, setEtablissements] = useState<EtablissementRef[]>(ETABLISSEMENTS_INITIALS);
  const [activeSubTab, setActiveSubTab] = useState<'etablissements' | 'communes' | 'series'>('etablissements');

  // Formulaire ajout établissement
  const [newEtabNom, setNewEtabNom] = useState('');
  const [newEtabCommune, setNewEtabCommune] = useState('Nikki');
  const [newEtabType, setNewEtabType] = useState<'Public' | 'Privé' | 'Militaire'>('Public');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleAddEtablissement = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNom = newEtabNom.trim();
    if (!cleanNom) return;

    // Empêcher la création de doublons (Section 9 du cahier des charges)
    const exists = etablissements.some(
      (et) => et.nom.toLowerCase() === cleanNom.toLowerCase() && et.commune === newEtabCommune
    );

    if (exists) {
      setMessage({
        text: `L’établissement « ${cleanNom} » existe déjà pour la commune de ${newEtabCommune}. Doublon évité.`,
        type: 'error',
      });
      return;
    }

    const nouveau: EtablissementRef = {
      nom: cleanNom,
      commune: newEtabCommune,
      type: newEtabType,
    };

    setEtablissements([nouveau, ...etablissements]);
    setMessage({
      text: `L’établissement « ${cleanNom} » a été ajouté au référentiel officiel.`,
      type: 'success',
    });
    setNewEtabNom('');
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#ED5312] uppercase tracking-wider">
            Gouvernance & Dictionnaire de Données
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mt-0.5">
          Référentiels Officiels du Borgou & Normes Scolaires
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Nomenclature standardisée des 8 communes, des collèges/lycées et des filières d'excellence pour prévenir les incohérences de saisie.
        </p>

        {/* Sous-onglets */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveSubTab('etablissements')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'etablissements'
                ? 'bg-[#ED5312] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>Établissements scolaires ({etablissements.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('communes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'communes'
                ? 'bg-[#ED5312] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>8 Communes du Borgou</span>
          </button>

          <button
            onClick={() => setActiveSubTab('series')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'series'
                ? 'bg-[#ED5312] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Séries & Examens</span>
          </button>
        </div>
      </div>

      {/* Message de notification */}
      {message && (
        <div
          className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. Établissements Scolaires */}
      {activeSubTab === 'etablissements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Formulaire d'ajout rapide */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#ED5312]" />
              Ajouter un Établissement
            </h3>
            <p className="text-xs text-slate-500">
              Enrichissez le référentiel scolaire sans risque de doublon.
            </p>

            <form onSubmit={handleAddEtablissement} className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nom de l'établissement
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CEG 3 Nikki"
                  value={newEtabNom}
                  onChange={(e) => setNewEtabNom(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Commune de rattachement
                </label>
                <select
                  value={newEtabCommune}
                  onChange={(e) => setNewEtabCommune(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                >
                  {COMMUNES_BORGOU.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Type d'établissement
                </label>
                <select
                  value={newEtabType}
                  onChange={(e) => setNewEtabType(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                >
                  <option value="Public">Public</option>
                  <option value="Privé">Privé</option>
                  <option value="Militaire">Militaire</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#ED5312] hover:bg-[#D64307] text-white font-bold rounded-lg text-xs transition-colors shadow-2xs mt-2"
              >
                Ajouter au référentiel
              </button>
            </form>
          </div>

          {/* Liste des établissements */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Répertoire des Établissements Certifiés ({etablissements.length})
            </h3>
            <div className="max-h-[460px] overflow-y-auto space-y-2 pr-1 text-xs">
              {etablissements.map((et, idx) => {
                const countLaureats = laureats.filter((l) => l.etablissement === et.nom).length;

                return (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <strong className="text-slate-900">{et.nom}</strong>
                      <div className="text-[11px] text-slate-500">
                        Commune : {et.commune} · Statut : {et.type}
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-mono text-[11px] font-semibold">
                      {countLaureats} primé{countLaureats > 1 ? 's' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Communes du Borgou */}
      {activeSubTab === 'communes' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            Les 8 Communes du Département du Borgou
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {COMMUNES_BORGOU.map((commune) => {
              const list = laureats.filter((l) => l.commune.toLowerCase() === commune.toLowerCase());
              return (
                <div key={commune} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-base text-slate-900">{commune}</strong>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-slate-600">
                    Département : <strong>Borgou</strong>
                  </div>
                  <div className="text-slate-600">
                    Total lauréats primés : <strong className="font-mono text-[#ED5312]">{list.length}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Séries & Examens */}
      {activeSubTab === 'series' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Niveaux d’Examens Nationaux
            </h3>
            <div className="space-y-2 text-xs">
              {EXAMENS.map((ex) => (
                <div key={ex} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                  <strong className="text-slate-900">{ex}</strong>
                  <span className="text-slate-500">
                    {ex === 'CEP' ? 'Certificat d’Études Primaires' : ex === 'BEPC' ? 'Brevet d’Études du Premier Cycle' : 'Baccalauréat National'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Séries du Baccalauréat Enregistrées
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {SERIES_BAC.map((serie) => (
                <span
                  key={serie}
                  className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 font-semibold text-slate-800"
                >
                  {serie}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
