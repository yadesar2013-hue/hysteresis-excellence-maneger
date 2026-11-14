/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { History, Download, Upload, RefreshCw, CheckCircle2, X } from 'lucide-react';

export const ActivityLogsView: React.FC = () => {
  const { logs, exporterSauvegardeJSON, importerSauvegardeJSON, reinitialiserBase } = useApp();
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const ok = await importerSauvegardeJSON(text);
        if (ok) {
          setImportStatus('Sauvegarde restaurée avec succès dans Firestore !');
        } else {
          setImportStatus('Erreur : Fichier JSON invalide.');
        }
      } catch {
        setImportStatus('Erreur lors de la lecture du fichier.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* En-tête Sauvegarde & Restauration */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#ED5312] uppercase tracking-wider">
            Sécurité & Traçabilité
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mt-0.5">
          Journal d'Activité & Sauvegardes
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Historique exhaustif et immuable de toutes les modifications, créations, attributions de rôles, imports et exports effectués sur la plateforme.
        </p>

        {/* Panneau d'actions de sauvegarde */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <button
            onClick={exporterSauvegardeJSON}
            className="p-3 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-left flex items-start gap-3 transition-colors shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-900 block font-bold">Exporter Sauvegarde JSON</strong>
              <span className="text-slate-500 text-[11px]">Télécharge un instantané complet de la base</span>
            </div>
          </button>

          <label className="p-3 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-left flex items-start gap-3 transition-colors shadow-2xs cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-900 block font-bold">Restaurer un fichier JSON</strong>
              <span className="text-slate-500 text-[11px]">Recharge un instantané sauvegardé</span>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setShowConfirmReset(true)}
            className="p-3 bg-slate-50 border border-slate-200 hover:border-red-300 rounded-xl text-left flex items-start gap-3 transition-colors shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-900 block font-bold">Réinitialiser Base</strong>
              <span className="text-slate-500 text-[11px]">Rétablit les 111 lauréats d'origine</span>
            </div>
          </button>
        </div>

        {importStatus && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>{importStatus}</span>
          </div>
        )}
      </div>

      {/* Table du journal d'activité */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-[#ED5312]" />
          Historique des Événements Récents ({logs.length})
        </h3>

        <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100 text-xs">
          {logs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      log.action === 'CREATION'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.action === 'MODIFICATION'
                        ? 'bg-blue-100 text-blue-800'
                        : log.action === 'SUPPRESSION'
                        ? 'bg-red-100 text-red-800'
                        : log.action === 'IMPORT'
                        ? 'bg-purple-100 text-purple-800'
                        : log.action === 'ADMIN_ROLE'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-orange-100 text-[#ED5312]'
                    }`}
                  >
                    {log.action}
                  </span>
                  <strong className="text-slate-900 font-semibold">{log.entite}</strong>
                </div>
                <p className="text-slate-600 text-[11px]">{log.details}</p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-slate-400 font-mono text-[10px]">
                  {new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-slate-500 text-[10px]">Par {log.utilisateur}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de confirmation réinitialisation */}
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
              Rétablir les 111 lauréats officiels ?
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Cette action réécrira les 111 fiches officielles de la Fondation Hystérésis (2022–2026) dans la base Firestore.
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
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
