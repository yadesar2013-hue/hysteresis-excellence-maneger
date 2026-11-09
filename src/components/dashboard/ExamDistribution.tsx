/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, School } from 'lucide-react';

export const ExamDistribution: React.FC = () => {
  const { laureats } = useApp();

  // Évolution par année et examen
  const editions = [2022, 2023, 2024, 2025, 2026];
  const yearData = editions.map((year) => {
    const subset = laureats.filter((l) => l.edition === year);
    return {
      year: `${year}`,
      CEP: subset.filter((l) => l.examen === 'CEP').length,
      BEPC: subset.filter((l) => l.examen === 'BEPC').length,
      BAC: subset.filter((l) => l.examen === 'BAC').length,
      Filles: subset.filter((l) => l.sexe === 'F').length,
      Total: subset.length,
    };
  });

  // Répartition par série au BAC
  const bacSubset = laureats.filter((l) => l.examen === 'BAC');
  const seriesMap: Record<string, number> = {};
  bacSubset.forEach((l) => {
    const s = l.serie || 'Non précisé';
    seriesMap[s] = (seriesMap[s] || 0) + 1;
  });

  const seriesData = Object.entries(seriesMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const COLORS_SERIES = ['#ED5312', '#2563EB', '#16A34A', '#9333EA', '#D97706', '#0891B2', '#E11D48'];

  // Top établissements
  const etabMap: Record<string, number> = {};
  laureats.forEach((l) => {
    if (l.etablissement) {
      etabMap[l.etablissement] = (etabMap[l.etablissement] || 0) + 1;
    }
  });

  const topEtabs = Object.entries(etabMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Graphique 1 : Évolution temporelle 2022-2026 par examen */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#ED5312]" />
              Évolution du Nombre de Lauréats par Édition (2022 - 2026)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Historique des récompenses par niveau d’examen (CEP, BEPC, BAC).
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            111 lauréats certifiés
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="year" stroke="#94A3B8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }}
                cursor={{ fill: '#F1F5F9' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="CEP" fill="#3B82F6" name="CEP" radius={[4, 4, 0, 0]} />
              <Bar dataKey="BEPC" fill="#8B5CF6" name="BEPC" radius={[4, 4, 0, 0]} />
              <Bar dataKey="BAC" fill="#ED5312" name="BAC" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphique 2 : Répartition des séries au BAC */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#ED5312]" />
              Séries du BAC (43 Lauréats)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Prédominance des filières scientifiques et techniques.
            </p>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={seriesData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={65}
                innerRadius={35}
                paddingAngle={3}
              >
                {seriesData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS_SERIES[index % COLORS_SERIES.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', borderRadius: '8px', fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto pr-1">
          {seriesData.map((s, idx) => (
            <div key={s.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS_SERIES[idx % COLORS_SERIES.length] }}
                />
                <span className="text-slate-700 font-medium">{s.name}</span>
              </div>
              <span className="font-mono font-bold text-slate-900">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top 6 des établissements les plus primés */}
      <div className="lg:col-span-12 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
          <School className="w-4 h-4 text-[#ED5312]" />
          Établissements Scolaires les Plus Distingués (2022 - 2026)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topEtabs.map(([nom, count], i) => (
            <div
              key={nom}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
            >
              <div className="min-w-0 pr-2">
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {i + 1}. {nom}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Distinctions régulières
                </div>
              </div>
              <span className="px-2 py-0.5 bg-orange-100 text-[#ED5312] font-mono font-bold text-xs rounded-md shrink-0">
                {count} lauréat{count > 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
