/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types/laureat';
import { Shield, HelpCircle, Download, RefreshCw, X, LogOut } from 'lucide-react';

interface HeaderProps {
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHelp }) => {
  const {
    currentRole,
    userProfile,
    signOut,
    laureats,
    reinitialiserBase,
    exporterSauvegardeJSON,
  } = useApp();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const rolesConfig: Record<UserRole, { label: string; badge: string }> = {
    admin: { label: 'Administrateur', badge: 'bg-amber-50 text-amber-900 border-amber-200' },
    manager: { label: 'Gestionnaire de programme', badge: 'bg-blue-50 text-blue-900 border-blue-200' },
    club_lead: { label: 'Responsable de club', badge: 'bg-purple-50 text-purple-900 border-purple-200' },
    partner: { label: 'Partenaire / Bailleur', badge: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
    pending: { label: 'En attente', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  };

  const roleMeta = rolesConfig[currentRole];
  const canExportBackup = currentRole === 'admin' || currentRole === 'manager';

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 lg:px-8 py-3 transition-colors shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Titre et institution */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ED5312] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              H
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#ED5312]">
                  Fondation Hystérésis
                </span>
                <span className="text-slate-300 text-xs">|</span>
                <span className="text-xs text-slate-500 font-medium">
                  Département du Borgou
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                Journée de l’Excellence en milieu scolaire
              </h1>
            </div>
          </div>

          {/* Utilisateur connecté, Rôle vérifié & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-end sm:self-center">
            {/* Compteur officiel */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Base active :</span>
              <strong className="text-slate-900 font-mono tabular-nums">{laureats.length} lauréats</strong>
            </div>

            {/* Profil vérifié côté serveur */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <Shield className="w-3.5 h-3.5 text-[#ED5312] shrink-0" />
              <div className="hidden md:flex flex-col leading-tight">
                <span className="font-semibold text-slate-900 truncate max-w-[140px]">
                  {userProfile?.displayName || userProfile?.email}
                </span>
                <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                  {userProfile?.email}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${roleMeta.badge}`}>
                {roleMeta.label}
              </span>
            </div>

            {/* Menu d'aide rapide */}
            <button
              onClick={onOpenHelp}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors"
              title="Guide d'utilisation et aide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Guide</span>
            </button>

            {/* Sauvegarde rapide (Admin / Gestionnaire) */}
            {canExportBackup && (
              <button
                onClick={exporterSauvegardeJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors"
                title="Sauvegarder l'état actuel en JSON"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Sauvegarde</span>
              </button>
            )}

            {/* Reset vers la base officielle */}
            {currentRole === 'admin' && (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                title="Rétablir la liste des 111 lauréats officiels"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Reset 111</span>
              </button>
            )}

            {/* Déconnexion */}
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Indicateur de protection des données pour Partenaire / Responsable de club */}
        {(currentRole === 'partner' || currentRole === 'club_lead') && (
          <div className="mt-2.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-between text-xs text-amber-900">
            <span>
              <strong>Protection des données personnelles active :</strong> En tant que {roleMeta.label}, les données nominatives complètes et coordonnées privées (téléphones, e-mails, dates de naissance) sont bloquées côté serveur.
            </span>
          </div>
        )}
      </header>

      {/* Modal Confirmation de Réinitialisation */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <RefreshCw className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-3">
              Rétablir les 111 lauréats originaux ?
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Cette action rechargera la liste officielle certifiée des 111 lauréats de la Fondation Hystérésis (éditions 2022 à 2026) dans la base cloud Firestore.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  setShowConfirmReset(false);
                  await reinitialiserBase();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#ED5312] hover:bg-[#D64307] rounded-md transition-colors shadow-xs"
              >
                Confirmer la réinitialisation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
