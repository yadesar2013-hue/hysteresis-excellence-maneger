/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FilterOptions } from '../../types/laureat';
import { COMMUNES_BORGOU, EXAMENS } from '../../data/referentielsBorgou';
import { Search, RotateCcw, Filter, Sparkles, Laptop, PhoneCall, Columns3 } from 'lucide-react';

interface LaureateFiltersProps {
  filters: FilterOptions;
  onChangeFilters: (newFilters: FilterOptions) => void;
  onResetFilters: () => void;
  totalFiltered: number;
  totalAll: number;
  visibleColumns: string[];
  onToggleColumn: (colKey: string) => void;
}

export const LaureateFilters: React.FC<LaureateFiltersProps> = ({
  filters,
  onChangeFilters,
  onResetFilters,
  totalFiltered,
  totalAll,
  visibleColumns,
  onToggleColumn,
}) => {
  const [showColPicker, setShowColPicker] = React.useState(false);

  const columnDefinitions = [
    { key: 'numeroOrigine', label: 'N° d’ordre' },
    { key: 'nom', label: 'Nom & Prénoms' },
    { key: 'sexe', label: 'Sexe' },
    { key: 'edition', label: 'Édition' },
    { key: 'examen', label: 'Examen' },
    { key: 'commune', label: 'Commune' },
    { key: 'etablissement', label: 'Établissement' },
    { key: 'moyenne', label: 'Moyenne' },
    { key: 'rang', label: 'Rang' },
    { key: 'serie', label: 'Série / Mention' },
    { key: 'telephone', label: 'Contact' },
    { key: 'dotations', label: 'Dotations (PC/Tab)' },
    { key: 'statutActuel', label: 'Statut Actuel' },
    { key: 'orientationStem', label: 'Orientation STEM' },
    { key: 'club', label: 'Digit’ELLES Club' },
    { key: 'statutRelance', label: 'Suivi & Relance' },
    { key: 'completude', label: 'Complétude' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3.5">
      {/* Barre de recherche principale & Actions rapides */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom, établissement, commune, contact, série, diplôme..."
            value={filters.searchQuery}
            onChange={(e) => onChangeFilters({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Sélecteur de colonnes */}
          <div className="relative">
            <button
              onClick={() => setShowColPicker(!showColPicker)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Columns3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Colonnes ({visibleColumns.length})</span>
            </button>

            {showColPicker && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-40 space-y-1.5 animate-in fade-in">
                <div className="text-[11px] font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Colonnes affichées</span>
                  <button
                    onClick={() => setShowColPicker(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Fermer
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                  {columnDefinitions.map((col) => (
                    <label
                      key={col.key}
                      className="flex items-center gap-2 text-xs text-slate-700 hover:bg-slate-50 p-1 rounded-md cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.key)}
                        onChange={() => onToggleColumn(col.key)}
                        className="rounded-xs text-[#ED5312] focus:ring-[#ED5312]"
                      />
                      <span>{col.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reset filtres */}
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Réinitialiser tous les filtres"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>
        </div>
      </div>

      {/* Rangée de filtres combinables */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-100 text-xs">
        {/* Édition */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
            Édition
          </label>
          <select
            value={filters.edition}
            onChange={(e) => onChangeFilters({ ...filters, edition: e.target.value })}
            className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
          >
            <option value="all">Toutes (2022-2026)</option>
            <option value="2022">2022 (19)</option>
            <option value="2023">2023 (31)</option>
            <option value="2024">2024 (24)</option>
            <option value="2025">2025 (24)</option>
            <option value="2026">2026 (13)</option>
          </select>
        </div>

        {/* Examen */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
            Examen
          </label>
          <select
            value={filters.examen}
            onChange={(e) => onChangeFilters({ ...filters, examen: e.target.value })}
            className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
          >
            <option value="all">Tous examens</option>
            {EXAMENS.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>
        </div>

        {/* Commune du Borgou */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
            Commune (Borgou)
          </label>
          <select
            value={filters.commune}
            onChange={(e) => onChangeFilters({ ...filters, commune: e.target.value })}
            className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
          >
            <option value="all">Toutes les 8 communes</option>
            {COMMUNES_BORGOU.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Sexe */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
            Sexe
          </label>
          <select
            value={filters.sexe}
            onChange={(e) => onChangeFilters({ ...filters, sexe: e.target.value })}
            className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
          >
            <option value="all">Tous (Filles & Garçons)</option>
            <option value="F">Filles (35)</option>
            <option value="M">Garçons (76)</option>
          </select>
        </div>

        {/* Orientation STEM */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
            Orientation STEM
          </label>
          <select
            value={filters.orientationStem}
            onChange={(e) => onChangeFilters({ ...filters, orientationStem: e.target.value })}
            className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
          >
            <option value="all">Toutes orientations</option>
            <option value="Oui">Filières STEM (Sciences/Tech)</option>
            <option value="Non">Filières Littéraires / Autres</option>
            <option value="Inconnue">Inconnue</option>
          </select>
        </div>

        {/* Statut Suivi */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
            Statut de Suivi
          </label>
          <select
            value={filters.statutRelance}
            onChange={(e) => onChangeFilters({ ...filters, statutRelance: e.target.value })}
            className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
          >
            <option value="all">Tous les statuts</option>
            <option value="À jour">À jour</option>
            <option value="À relancer">À relancer</option>
            <option value="Sans contact">Sans contact récent</option>
            <option value="Traité">Traité</option>
          </select>
        </div>
      </div>

      {/* Raccourcis de filtres instantanés & Compteur de résultats */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-500 font-medium">Filtres rapides :</span>
          <button
            onClick={() => onChangeFilters({ ...filters, sexe: filters.sexe === 'F' ? 'all' : 'F' })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              filters.sexe === 'F'
                ? 'bg-pink-100 text-pink-900 border border-pink-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Sparkles className="w-3 h-3 text-pink-600" />
            <span>Lauréates Filles</span>
          </button>

          <button
            onClick={() =>
              onChangeFilters({
                ...filters,
                seulementOrdinateurs: !filters.seulementOrdinateurs,
              })
            }
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              filters.seulementOrdinateurs
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Laptop className="w-3 h-3 text-emerald-600" />
            <span>Dotés d’ordinateur</span>
          </button>

          <button
            onClick={() =>
              onChangeFilters({
                ...filters,
                statutRelance: filters.statutRelance === 'À relancer' ? 'all' : 'À relancer',
              })
            }
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              filters.statutRelance === 'À relancer'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <PhoneCall className="w-3 h-3 text-amber-600" />
            <span>À relancer</span>
          </button>
        </div>

        <div className="text-xs text-slate-600 font-medium">
          Affichage de <strong className="text-slate-900 font-mono">{totalFiltered}</strong> sur{' '}
          <strong className="text-slate-900 font-mono">{totalAll}</strong> lauréats
        </div>
      </div>
    </div>
  );
};
