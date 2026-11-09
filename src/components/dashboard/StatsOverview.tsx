/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Award, Laptop, Sparkles, AlertCircle, TrendingUp, CheckCircle, GraduationCap } from 'lucide-react';

interface StatsOverviewProps {
  onFilterCommune?: (commune: string) => void;
  onFilterExamen?: (examen: string) => void;
  onFilterFilles?: () => void;
  onFilterARelancer?: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  onFilterCommune,
  onFilterExamen,
  onFilterFilles,
  onFilterARelancer,
}) => {
  const { laureats, clubs } = useApp();

  const total = laureats.length;
  const filles = laureats.filter((l) => l.sexe === 'F').length;
  const garcons = laureats.filter((l) => l.sexe === 'M').length;
  const pctFilles = total > 0 ? Math.round((filles / total) * 100) : 0;

  const cep = laureats.filter((l) => l.examen === 'CEP').length;
  const bepc = laureats.filter((l) => l.examen === 'BEPC').length;
  const bac = laureats.filter((l) => l.examen === 'BAC').length;

  const ordinateurs = laureats.filter((l) => l.ordinateurRecu).length;
  const tablettes = laureats.filter((l) => l.tabletteRecue).length;
  const bourses = laureats.filter((l) => l.bourseRecue).length;

  const stem = laureats.filter((l) => l.orientationStem === 'Oui').length;
  const membresClubs = laureats.filter((l) => l.participationClub).length;
  const aRelancer = laureats.filter((l) => l.statutRelance === 'À relancer').length;

  const scoreMoyen =
    total > 0
      ? Math.round(laureats.reduce((acc, curr) => acc + curr.tauxCompletude, 0) / total)
      : 0;

  return (
    <div className="space-y-4">
      {/* 4 Cartes Maîtresses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* Total Lauréats */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-[#ED5312]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Total des lauréats
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#ED5312] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {total}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              éditions 2022-2026
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Parité F/G :</span>
            <span className="font-semibold text-slate-900">
              {filles} filles ({pctFilles}%) · {garcons} garçons
            </span>
          </div>
        </div>

        {/* Filles d'Excellence */}
        <div
          onClick={onFilterFilles}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-pink-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Lauréates filles
            </span>
            <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-pink-700 font-mono tabular-nums">
              {filles}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 font-semibold">
              {pctFilles}% de la cohorte
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Digit’ELLES Clubs :</span>
            <span className="font-semibold text-slate-900">
              {membresClubs} filles actives
            </span>
          </div>
        </div>

        {/* Récompenses & Dotations */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-[#ED5312]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Dotations distribuées
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {ordinateurs}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ordinateurs portables
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Tablettes & Bourses :</span>
            <span className="font-semibold text-slate-900">
              {tablettes} tablettes · {bourses} bourses
            </span>
          </div>
        </div>

        {/* Suivi & Qualité */}
        <div
          onClick={onFilterARelancer}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-amber-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Suivi & Complétude
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {scoreMoyen}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              qualité des données
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>À relancer :</span>
            <span className="font-bold text-amber-700 font-mono">
              {aRelancer} dossiers
            </span>
          </div>
        </div>
      </div>

      {/* Bandeau d'accès rapide par niveau d'examen */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-[#ED5312]" />
          <span className="text-xs font-bold text-slate-800">
            Répartition par Examen National :
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onFilterExamen?.('CEP')}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-medium text-blue-900 transition-colors"
          >
            <span>CEP :</span>
            <strong className="font-mono">{cep} lauréats</strong>
          </button>
          <button
            onClick={() => onFilterExamen?.('BEPC')}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-medium text-purple-900 transition-colors"
          >
            <span>BEPC :</span>
            <strong className="font-mono">{bepc} lauréats</strong>
          </button>
          <button
            onClick={() => onFilterExamen?.('BAC')}
            className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg text-xs font-medium text-orange-900 transition-colors"
          >
            <span>BAC :</span>
            <strong className="font-mono">{bac} lauréats</strong>
          </button>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-900">
            <span>Orientation STEM :</span>
            <strong className="font-mono">{stem} lauréats ({total > 0 ? Math.round((stem / total) * 100) : 0}%)</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
