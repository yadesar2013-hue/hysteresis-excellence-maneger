/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, School, Award, ChevronRight } from 'lucide-react';

interface BorgouMapChartProps {
  onSelectCommune: (commune: string) => void;
}

export const BorgouMapChart: React.FC<BorgouMapChartProps> = ({ onSelectCommune }) => {
  const { laureats } = useApp();
  const [selectedCommuneState, setSelectedCommuneState] = useState<string | null>(null);

  // Liste des 8 communes du Borgou
  const communes = [
    { name: 'Nikki', x: 70, y: 35, desc: 'Pôle d’excellence historique (Mont Carmel, St Augustin)' },
    { name: 'Kalalé', x: 75, y: 15, desc: 'Frontière nord-est (CEG1 Kalalé, Bouka, Gnel-Gouissa)' },
    { name: 'Bembéréké', x: 40, y: 20, desc: 'Prytanée Militaire PMB, CEG Ina, Lycée Technique' },
    { name: 'Sinendé', x: 20, y: 30, desc: 'Nord-ouest (CEG Sékéré, CEG Fô-Bouré, Miracle)' },
    { name: "N'Dali", x: 42, y: 50, desc: 'Carrefour central (CPEG Mon Avenir Plus, Sirarou)' },
    { name: 'Pèrèrè', x: 68, y: 60, desc: 'Est Borgou (CEG 1 Péréré, CEG Nonsina)' },
    { name: 'Parakou', x: 38, y: 68, desc: 'Métropole régionale (CP Academia, St François de Sales)' },
    { name: 'Tchaourou', x: 40, y: 88, desc: 'Sud Borgou (Père Georges Hounyeme, Yébessi)' },
  ];

  // Calcul des stats par commune
  const communeStats = communes.map((c) => {
    const list = laureats.filter((l) => l.commune.toLowerCase().trim() === c.name.toLowerCase().trim());
    const filles = list.filter((l) => l.sexe === 'F').length;
    const ordinateurs = list.filter((l) => l.ordinateurRecu).length;
    const moyAvg =
      list.length > 0
        ? (list.reduce((acc, curr) => acc + curr.moyenne, 0) / list.length).toFixed(2)
        : '0.00';

    return {
      ...c,
      total: list.length,
      filles,
      ordinateurs,
      moyAvg,
      etablissements: Array.from(new Set(list.map((l) => l.etablissement))),
    };
  });

  const activeCommune = communeStats.find((c) => c.name === selectedCommuneState) || communeStats[0];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#ED5312]" />
            Cartographie & Répartition dans le Département du Borgou (8 Communes)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cliquez sur une commune pour explorer ses statistiques scolaires et ses établissements primés.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 bg-orange-50 text-[#ED5312] font-semibold rounded-md border border-orange-100">
          8 Communes représentées
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Schéma géographique stylisé du Borgou */}
        <div className="lg:col-span-7 bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 relative min-h-[340px] flex items-center justify-center overflow-hidden">
          {/* Contour décoratif du Borgou */}
          <svg className="w-full h-80 max-w-md" viewBox="0 0 100 100" fill="none">
            {/* Lignes de liaison géographiques */}
            <path
              d="M 40 20 L 70 35 L 75 15 L 70 35 L 68 60 L 42 50 L 38 68 L 40 88"
              stroke="#CBD5E1"
              strokeWidth="0.8"
              strokeDasharray="2,2"
            />
            <path
              d="M 20 30 L 40 20 L 42 50 L 38 68"
              stroke="#CBD5E1"
              strokeWidth="0.8"
              strokeDasharray="2,2"
            />

            {/* Communes géolocalisées */}
            {communeStats.map((c) => {
              const isSelected = (selectedCommuneState || communeStats[0].name) === c.name;
              return (
                <g
                  key={c.name}
                  onClick={() => {
                    setSelectedCommuneState(c.name);
                    onSelectCommune(c.name);
                  }}
                  className="cursor-pointer transition-all transform hover:scale-110"
                >
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isSelected ? 6 : Math.max(3.5, Math.min(5.5, c.total / 3))}
                    fill={isSelected ? '#ED5312' : '#F97316'}
                    fillOpacity={isSelected ? 0.95 : 0.75}
                    stroke="#FFFFFF"
                    strokeWidth={isSelected ? 1.5 : 1}
                  />
                  <text
                    x={c.x}
                    y={c.y - 7}
                    textAnchor="middle"
                    className={`text-[3.8px] font-sans font-bold select-none ${
                      isSelected ? 'fill-slate-950 font-extrabold' : 'fill-slate-700'
                    }`}
                  >
                    {c.name} ({c.total})
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Détails de la commune sélectionnée */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#ED5312]">
                  Commune sélectionnée
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  {activeCommune.name}
                </h3>
              </div>
              <button
                onClick={() => onSelectCommune(activeCommune.name)}
                className="px-3 py-1.5 bg-[#ED5312] text-white hover:bg-[#D64307] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
              >
                <span>Filtrer les fiches</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-2">
              {activeCommune.desc}
            </p>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-200/60">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-medium">Lauréats</span>
                <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
                  {activeCommune.total}
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-medium">Filles</span>
                <div className="text-lg font-mono font-bold text-pink-600 mt-0.5">
                  {activeCommune.filles}
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-medium">Moy. Gnl.</span>
                <div className="text-lg font-mono font-bold text-emerald-600 mt-0.5">
                  {activeCommune.moyAvg}
                </div>
              </div>
            </div>

            {/* Établissements primés dans cette commune */}
            <div className="mt-4 pt-3 border-t border-slate-200/60">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                <School className="w-3.5 h-3.5 text-slate-400" />
                Établissements scolaires primés ({activeCommune.etablissements.length}) :
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {activeCommune.etablissements.map((etab) => (
                  <span
                    key={etab}
                    className="text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700"
                  >
                    {etab}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grille des 8 communes en boutons d'accès rapide */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {communeStats.map((c) => (
          <button
            key={c.name}
            onClick={() => {
              setSelectedCommuneState(c.name);
              onSelectCommune(c.name);
            }}
            className={`p-2 rounded-lg border text-left transition-all ${
              (selectedCommuneState || communeStats[0].name) === c.name
                ? 'bg-orange-50 border-[#ED5312] shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-[11px] font-bold text-slate-900 truncate">{c.name}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
              {c.total} lauréat{c.total > 1 ? 's' : ''}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
