/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, BookOpen, ShieldCheck, Sparkles, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="bg-[#ED5312] text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Guide d'Utilisation — Hystérésis Excellence Manager
            </h3>
            <p className="text-xs text-orange-100 mt-0.5">
              Fondation Hystérésis · Journée de l’Excellence en milieu scolaire
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* 1. Présentation */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1.5 text-[#ED5312]">
              1. Objet & Cohorte Initiale
            </h4>
            <p>
              L’application centralise la liste des <strong>111 lauréats officiels</strong> primés entre 2022 et 2026 dans les 8 communes du Borgou (Bénin) : Bembéréké, Kalalé, Nikki, N'Dali, Parakou, Pèrèrè, Sinendé et Tchaourou. Elle permet d'ajouter les cohortes 2027 et suivantes en toute fluidité.
            </p>
          </div>

          {/* 2. Règle des Digit'ELLES Clubs */}
          <div className="p-4 bg-pink-50 border border-pink-200 rounded-xl space-y-2">
            <h4 className="font-bold text-pink-950 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-600" />
              <span>2. Statuts des Digit'ELLES Clubs (Règle des 12 Filles)</span>
            </h4>
            <p className="text-pink-900 text-[11px]">
              Chaque Digit’ELLES Club a une capacité maximale de <strong>12 filles</strong> réparties équitablement :
            </p>
            <ul className="list-disc pl-5 text-pink-900 text-[11px] space-y-0.5">
              <li>3 filles en classe de 3ᵉ</li>
              <li>3 filles en classe de Seconde</li>
              <li>3 filles en classe de Première</li>
              <li>3 filles en classe de Terminale</li>
            </ul>
            <p className="text-pink-900 text-[11px]">
              L’application déclenche une alerte visuelle automatique dès qu’un club dépasse cette jauge ou qu'un niveau comprend plus de 3 membres.
            </p>
          </div>

          {/* 3. Trajectoires d'Excellence & Doublons */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1.5 text-[#ED5312]">
              3. Trajectoires Multi-Examens
            </h4>
            <p>
              Certains lauréats d’exception ont été distingués à plusieurs reprises (ex : <em>ADANLIN Orel Bérenger</em> et <em>ASSOUMA Madjida</em>, primés au BEPC 2023 puis au BAC 2026). L'application relie automatiquement ces fiches afin de valoriser leur parcours d'excellence dans le temps.
            </p>
          </div>

          {/* 4. Importation & Exportation */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1.5 text-[#ED5312]">
              4. Importation Excel & Protection des Données
            </h4>
            <p>
              Le module d'import supporte les formats <strong>.xlsx, .xls et .csv</strong> avec mapping automatique des colonnes et contrôle des doublons. En mode <strong>Partenaire / Bailleur</strong>, toutes les données privées (téléphone, e-mail, nom complet) sont automatiquement anonymisées pour respecter la législation APDP/RGPD.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#ED5312] hover:bg-[#D64307] text-white rounded-lg text-xs font-bold"
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
};
