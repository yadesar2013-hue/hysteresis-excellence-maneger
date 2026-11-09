/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileSpreadsheet,
  GitMerge,
  PhoneCall,
  Sparkles,
  BookOpen,
  History,
  ShieldCheck,
} from 'lucide-react';

export type TabKey =
  | 'dashboard'
  | 'laureats'
  | 'add'
  | 'import'
  | 'duplicates'
  | 'followup'
  | 'clubs'
  | 'referentiels'
  | 'logs';

interface SidebarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { laureats, clubs, currentRole } = useApp();

  // Calculs rapides pour badges réactifs
  const totalLaureats = laureats.length;
  const lauratesARelancer = laureats.filter((l) => l.statutRelance === 'À relancer').length;
  const membresClubs = laureats.filter((l) => l.participationClub).length;

  const navItems: {
    key: TabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    allowedRoles?: string[];
  }[] = [
    {
      key: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      key: 'laureats',
      label: 'Répertoire des lauréats',
      icon: Users,
      badge: totalLaureats,
      badgeColor: 'bg-slate-100 text-slate-800',
    },
    {
      key: 'add',
      label: 'Ajouter un lauréat',
      icon: UserPlus,
      allowedRoles: ['admin', 'manager'],
    },
    {
      key: 'import',
      label: 'Importateur Excel / CSV',
      icon: FileSpreadsheet,
      allowedRoles: ['admin', 'manager'],
    },
    {
      key: 'duplicates',
      label: 'Doublons & Parcours',
      icon: GitMerge,
    },
    {
      key: 'followup',
      label: 'Suivi post-lauréat',
      icon: PhoneCall,
      badge: lauratesARelancer > 0 ? lauratesARelancer : undefined,
      badgeColor: 'bg-amber-100 text-amber-900',
    },
    {
      key: 'clubs',
      label: "Digit'ELLES Clubs",
      icon: Sparkles,
      badge: membresClubs,
      badgeColor: 'bg-orange-100 text-[#ED5312]',
    },
    {
      key: 'referentiels',
      label: 'Référentiels Borgou',
      icon: BookOpen,
      allowedRoles: ['admin', 'manager'],
    },
    {
      key: 'logs',
      label: "Journal d'activité & Sauvegarde",
      icon: History,
      allowedRoles: ['admin'],
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between">
      <div className="p-3 lg:p-4">
        {/* Encart promotionnel ou résumé institutionnel */}
        <div className="hidden lg:block px-3 py-2.5 mb-4 bg-orange-50/70 border border-orange-100 rounded-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#ED5312]">
            <ShieldCheck className="w-4 h-4" />
            <span>Fondation Hystérésis</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Excellence scolaire dans les 8 communes du Borgou (2022-2026+).
          </p>
        </div>

        {/* Liens de navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            if (item.allowedRoles && !item.allowedRoles.includes(currentRole)) {
              return null;
            }

            const isActive = activeTab === item.key;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#ED5312] text-white shadow-xs font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 text-[10px] font-mono tabular-nums rounded-md font-semibold shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Pied de sidebar */}
      <div className="p-4 border-t border-slate-200 text-[11px] text-slate-500 hidden lg:block">
        <div className="flex items-center justify-between">
          <span>Éditions couvertes</span>
          <strong className="text-slate-700 font-mono">2022 - 2026</strong>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span>Communes Borgou</span>
          <strong className="text-slate-700 font-mono">8 communes</strong>
        </div>
        <p className="mt-3 text-[10px] text-slate-400">
          © Fondation Hystérésis · Tous droits réservés
        </p>
      </div>
    </aside>
  );
};
