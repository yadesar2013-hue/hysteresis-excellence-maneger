/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types/laureat';
import { Shield, User, HelpCircle, Download, RefreshCw, X, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHelp }) => {
  const { currentRole, setCurrentRole, laureats, reinitialiserBase, exporterSauvegardeJSON } = useApp();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const rolesConfig: Record<UserRole, { label: string; badge: string; desc: string }> = {
    admin: { label: 'Administrateur', badge: 'bg-amber-100 text-amber-900 border-amber-300', desc: 'Accès complet, gestion globale et suppressions' },
    manager: { label: 'Gestionnaire de programme', badge: 'bg-blue-100 text-blue-900 border-blue-300', desc: 'Gestion des fiches, suivi et clubs' },
    club_lead: { label: 'Responsable de club', badge: 'bg-purple-100 text-purple-900 border-purple-300', desc: 'Accès restreint au club et activités' },
    partner: { label: 'Partenaire / Bailleur', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300', desc: 'Statistiques et fiches avec données privées masquées' },
  };

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

          {/* Rôle utilisateur, Actions globales & Aide */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 self-end sm:self-center">
            {/* Compteur officiel */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Base active :</span>
              <strong className="text-slate-900 font-mono tabular-nums">{laureats.length} lauréats</strong>
            </div>

            {/* Sélecteur de rôle */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
              <div className="flex items-center gap-1.5 px-2 text-slate-500">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium hidden lg:inline">Profil :</span>
              </div>
              <select
                aria-label="Profil utilisateur"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                className="bg-white border border-slate-200 rounded-md px-2.5 py-1 font-medium text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
              >
                <option value="admin">Administrateur (Complet)</option>
                <option value="manager">Gestionnaire de programme</option>
                <option value="club_lead">Responsable de club</option>
                <option value="partner">Partenaire / Bailleur (Anonymisé)</option>
              </select>
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

            {/* Sauvegarde rapide */}
            <button
              onClick={exporterSauvegardeJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors"
              title="Sauvegarder l'état actuel en JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Sauvegarde</span>
            </button>

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
          </div>
        </div>

        {/* Indicateur de mode anonymisé partenaire */}
        {currentRole === 'partner' && (
          <div className="mt-2.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-between text-xs text-amber-900">
            <span>
              <strong>Mode Consultation Partenaire & Bailleur activé :</strong> Les noms sont restreints et les coordonnées privées (téléphone, e-mail) sont automatiquement masquées pour la protection des données.
            </span>
            <button
              onClick={() => setCurrentRole('admin')}
              className="underline font-semibold ml-2 text-amber-950 hover:text-[#ED5312]"
            >
              Passer en Admin
            </button>
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
              Cette action rechargera la liste officielle certifiée des 111 lauréats de la Fondation Hystérésis (éditions 2022 à 2026) dans le Borgou.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  reinitialiserBase();
                  setShowConfirmReset(false);
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
