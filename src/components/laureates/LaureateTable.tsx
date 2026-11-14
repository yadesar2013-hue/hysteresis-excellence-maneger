/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Laureat } from '../../types/laureat';
import { useApp } from '../../context/AppContext';
import { exporterEnExcel, exporterEnCSV } from '../../utils/exportUtils';
import {
  FileSpreadsheet,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  Sparkles,
  Laptop,
  CheckCircle2,
  GitCommit,
  Phone,
  ArrowUpDown,
} from 'lucide-react';

interface LaureateTableProps {
  laureats: Laureat[];
  visibleColumns: string[];
  onSelectLaureat: (laureat: Laureat) => void;
  onEditLaureat: (laureat: Laureat) => void;
  onDeleteLaureat: (id: string) => void;
}

export const LaureateTable: React.FC<LaureateTableProps> = ({
  laureats,
  visibleColumns,
  onSelectLaureat,
  onEditLaureat,
  onDeleteLaureat,
}) => {
  const { currentRole } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<keyof Laureat>('edition');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isAnonymized = currentRole === 'partner' || currentRole === 'club_lead';
  const canEditFiches = currentRole === 'admin' || currentRole === 'manager';

  // Tri
  const sortedLaureats = useMemo(() => {
    return [...laureats].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [laureats, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedLaureats.length / pageSize));
  const paginatedLaureats = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedLaureats.slice(start, start + pageSize);
  }, [sortedLaureats, currentPage, pageSize]);

  const toggleSort = (field: keyof Laureat) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedLaureats.map((l) => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const exportSelectionOrAll = (format: 'xlsx' | 'csv') => {
    const dataToExport =
      selectedIds.length > 0
        ? laureats.filter((l) => selectedIds.includes(l.id))
        : laureats;

    if (format === 'xlsx') {
      exporterEnExcel(dataToExport, `Laureats_Fondation_Hysteresis_${new Date().toISOString().split('T')[0]}.xlsx`, isAnonymized);
    } else {
      exporterEnCSV(dataToExport, `Laureats_Fondation_Hysteresis_${new Date().toISOString().split('T')[0]}.csv`, isAnonymized);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
      {/* Barre d'actions au-dessus du tableau */}
      <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">
            {selectedIds.length > 0 ? `${selectedIds.length} sélectionné(s)` : 'Tous les résultats filtrés :'}
          </span>
          <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
            {laureats.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportSelectionOrAll('xlsx')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-md font-medium text-slate-700 hover:text-slate-900 transition-colors shadow-2xs"
            title="Exporter la liste en fichier Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => exportSelectionOrAll('csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-md font-medium text-slate-700 hover:text-slate-900 transition-colors shadow-2xs"
            title="Exporter la liste en fichier CSV"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-md font-medium text-slate-700 hover:text-slate-900 transition-colors shadow-2xs"
            title="Imprimer cette liste ou exporter en PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      {/* Grille de données défilable horizontalement */}
      <div className="overflow-x-auto min-h-[380px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider select-none">
              <th className="py-2.5 px-3 w-8">
                <input
                  type="checkbox"
                  aria-label="Sélectionner tous les lauréats"
                  checked={
                    paginatedLaureats.length > 0 &&
                    selectedIds.length === paginatedLaureats.length
                  }
                  onChange={handleSelectAll}
                  className="rounded-xs text-[#ED5312] focus:ring-[#ED5312]"
                />
              </th>
              {visibleColumns.includes('numeroOrigine') && (
                <th
                  onClick={() => toggleSort('numeroOrigine')}
                  className="py-2.5 px-2.5 cursor-pointer hover:bg-slate-200/60"
                >
                  <div className="flex items-center gap-1">
                    <span>N°</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              )}
              {visibleColumns.includes('nom') && (
                <th
                  onClick={() => toggleSort('nom')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/60"
                >
                  <div className="flex items-center gap-1">
                    <span>Nom & Prénoms</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              )}
              {visibleColumns.includes('sexe') && <th className="py-2.5 px-2 text-center">Sexe</th>}
              {visibleColumns.includes('edition') && (
                <th
                  onClick={() => toggleSort('edition')}
                  className="py-2.5 px-2.5 cursor-pointer hover:bg-slate-200/60"
                >
                  <div className="flex items-center gap-1">
                    <span>Édition</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              )}
              {visibleColumns.includes('examen') && <th className="py-2.5 px-2.5">Examen</th>}
              {visibleColumns.includes('commune') && (
                <th
                  onClick={() => toggleSort('commune')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/60"
                >
                  <div className="flex items-center gap-1">
                    <span>Commune</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              )}
              {visibleColumns.includes('etablissement') && (
                <th className="py-2.5 px-3">Établissement</th>
              )}
              {visibleColumns.includes('moyenne') && (
                <th
                  onClick={() => toggleSort('moyenne')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200/60"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Moyenne</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              )}
              {visibleColumns.includes('rang') && <th className="py-2.5 px-2.5">Rang</th>}
              {visibleColumns.includes('serie') && <th className="py-2.5 px-3">Série / Mention</th>}
              {visibleColumns.includes('telephone') && <th className="py-2.5 px-3">Contact</th>}
              {visibleColumns.includes('dotations') && <th className="py-2.5 px-2.5 text-center">Dotations</th>}
              {visibleColumns.includes('statutActuel') && <th className="py-2.5 px-3">Statut actuel</th>}
              {visibleColumns.includes('orientationStem') && <th className="py-2.5 px-2 text-center">STEM</th>}
              {visibleColumns.includes('club') && <th className="py-2.5 px-2.5">Club</th>}
              {visibleColumns.includes('statutRelance') && <th className="py-2.5 px-2.5">Suivi</th>}
              {visibleColumns.includes('completude') && (
                <th
                  onClick={() => toggleSort('tauxCompletude')}
                  className="py-2.5 px-2.5 text-center cursor-pointer hover:bg-slate-200/60"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Qualité</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              )}
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedLaureats.length === 0 ? (
              <tr>
                <td colSpan={20} className="py-12 text-center text-slate-500">
                  <div className="max-w-sm mx-auto space-y-2">
                    <p className="font-semibold text-slate-700">Aucun lauréat ne correspond à ces critères</p>
                    <p className="text-xs text-slate-400">
                      Essayez de réinitialiser vos filtres ou de modifier votre recherche.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedLaureats.map((laureat) => {
                const isSelected = selectedIds.includes(laureat.id);
                const hasLinkedPath = (laureat.parcoursLiesIds || []).length > 0;

                return (
                  <tr
                    key={laureat.id}
                    className={`hover:bg-orange-50/40 transition-colors ${
                      isSelected ? 'bg-orange-50/70' : ''
                    }`}
                  >
                    <td className="py-2 px-3">
                      <input
                        type="checkbox"
                        aria-label={`Sélectionner ${laureat.nom} ${laureat.prenoms}`}
                        checked={isSelected}
                        onChange={() => handleSelectOne(laureat.id)}
                        className="rounded-xs text-[#ED5312] focus:ring-[#ED5312]"
                      />
                    </td>

                    {visibleColumns.includes('numeroOrigine') && (
                      <td className="py-2 px-2.5 font-mono text-slate-400 tabular-nums">
                        {laureat.numeroOrigine ? `#${laureat.numeroOrigine}` : '—'}
                      </td>
                    )}

                    {visibleColumns.includes('nom') && (
                      <td className="py-2 px-3 font-medium text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onSelectLaureat(laureat)}
                            className="font-bold text-slate-900 hover:text-[#ED5312] hover:underline text-left"
                          >
                            {isAnonymized ? `${laureat.nom.charAt(0)}*** ${laureat.prenoms.charAt(0)}***` : `${laureat.nom} ${laureat.prenoms}`}
                          </button>

                          {/* Badge Parcours d'excellence multi-examens (ex: ADANLIN Orel, ASSOUMA Madjida) */}
                          {hasLinkedPath && (
                            <span
                              title="Lauréat distingué à plusieurs examens nationaux (parcours relié)"
                              className="px-1.5 py-0.5 rounded-sm bg-purple-100 text-purple-800 text-[9px] font-bold flex items-center gap-0.5"
                            >
                              <GitCommit className="w-2.5 h-2.5" />
                              Multi
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('sexe') && (
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`font-mono font-bold text-xs ${
                            laureat.sexe === 'F' ? 'text-pink-600' : 'text-blue-600'
                          }`}
                        >
                          {laureat.sexe}
                        </span>
                      </td>
                    )}

                    {visibleColumns.includes('edition') && (
                      <td className="py-2 px-2.5 font-mono font-semibold text-slate-700 tabular-nums">
                        {laureat.edition}
                      </td>
                    )}

                    {visibleColumns.includes('examen') && (
                      <td className="py-2 px-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                            laureat.examen === 'BAC'
                              ? 'bg-orange-100 text-[#ED5312]'
                              : laureat.examen === 'BEPC'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {laureat.examen}
                        </span>
                      </td>
                    )}

                    {visibleColumns.includes('commune') && (
                      <td className="py-2 px-3 font-medium text-slate-700 whitespace-nowrap">
                        {laureat.commune}
                      </td>
                    )}

                    {visibleColumns.includes('etablissement') && (
                      <td className="py-2 px-3 text-slate-700 max-w-xs truncate" title={laureat.etablissement}>
                        {laureat.etablissement}
                      </td>
                    )}

                    {visibleColumns.includes('moyenne') && (
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {laureat.moyenne.toFixed(2)}
                      </td>
                    )}

                    {visibleColumns.includes('rang') && (
                      <td className="py-2 px-2.5 text-slate-600 font-medium whitespace-nowrap">
                        {laureat.rang}
                      </td>
                    )}

                    {visibleColumns.includes('serie') && (
                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                        {laureat.serie || (laureat.moyenneEntreeSixieme ? `Entrée 6è: ${laureat.moyenneEntreeSixieme}` : '—')}
                        {laureat.mention && (
                          <span className="text-slate-400 text-[10px] ml-1">
                            ({laureat.mention})
                          </span>
                        )}
                      </td>
                    )}

                    {visibleColumns.includes('telephone') && (
                      <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {isAnonymized ? (
                          <span className="text-slate-400 italic">Masqué</span>
                        ) : laureat.telephone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {laureat.telephone}
                          </span>
                        ) : (
                          <span className="text-slate-300">Non renseigné</span>
                        )}
                      </td>
                    )}

                    {visibleColumns.includes('dotations') && (
                      <td className="py-2 px-2.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {laureat.ordinateurRecu && (
                            <span title="Ordinateur portable remis" className="text-emerald-600">
                              <Laptop className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {laureat.tabletteRecue && (
                            <span title="Tablette éducative remise" className="text-blue-600 text-[10px] font-bold">
                              Tab
                            </span>
                          )}
                          {laureat.bourseRecue && (
                            <span title="Bourse d'excellence octroyée" className="text-amber-600 text-[10px] font-bold">
                              Bourse
                            </span>
                          )}
                          {!laureat.ordinateurRecu && !laureat.tabletteRecue && !laureat.bourseRecue && (
                            <span className="text-slate-300">—</span>
                          )}
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('statutActuel') && (
                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                        {laureat.statutActuel}
                      </td>
                    )}

                    {visibleColumns.includes('orientationStem') && (
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`font-semibold text-[11px] ${
                            laureat.orientationStem === 'Oui'
                              ? 'text-emerald-700'
                              : laureat.orientationStem === 'Non'
                              ? 'text-slate-500'
                              : 'text-slate-300'
                          }`}
                        >
                          {laureat.orientationStem}
                        </span>
                      </td>
                    )}

                    {visibleColumns.includes('club') && (
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        {laureat.participationClub ? (
                          <span className="text-pink-700 font-semibold text-[11px]">
                            {laureat.clubCommune || 'Membre'}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    )}

                    {visibleColumns.includes('statutRelance') && (
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            laureat.statutRelance === 'À relancer'
                              ? 'bg-amber-100 text-amber-800'
                              : laureat.statutRelance === 'À jour'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {laureat.statutRelance}
                        </span>
                      </td>
                    )}

                    {visibleColumns.includes('completude') && (
                      <td className="py-2 px-2.5 text-center">
                        <span
                          className={`font-mono font-bold text-[11px] ${
                            laureat.tauxCompletude >= 90
                              ? 'text-emerald-600'
                              : laureat.tauxCompletude >= 70
                              ? 'text-amber-600'
                              : 'text-red-500'
                          }`}
                        >
                          {laureat.tauxCompletude}%
                        </span>
                      </td>
                    )}

                    {/* Actions */}
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectLaureat(laureat)}
                          className="p-1 text-slate-500 hover:text-[#ED5312] hover:bg-orange-50 rounded-md transition-colors"
                          title="Consulter la fiche détaillée"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canEditFiches && (
                          <button
                            onClick={() => onEditLaureat(laureat)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Modifier la fiche"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {currentRole === 'admin' && (
                          <button
                            onClick={() => onDeleteLaureat(laureat.id)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Archiver ou supprimer la fiche"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Contrôle du nombre de lignes */}
      <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Lignes par page :</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-200 rounded-md px-2 py-1 font-medium text-slate-800"
          >
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="font-mono tabular-nums">
            {(currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, sortedLaureats.length)} sur {sortedLaureats.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
            title="Page précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono font-medium">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
            title="Page suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
