/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { Laureat } from '../../types/laureat';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  ArrowRight,
  RefreshCw,
  FileText,
} from 'lucide-react';

export const FileImporter: React.FC = () => {
  const { batchImportLaureats } = useApp();

  const [rawRows, setRawRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [importMode, setImportMode] = useState<'skip_doublons' | 'ecraser_doublons' | 'completer_vides' | 'importer_tout'>('completer_vides');
  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState<{
    ajoutes: number;
    ignores: number;
    fusionnes: number;
    erreurs: string[];
  } | null>(null);

  // Mapping interactif des colonnes
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  const targetFields = [
    { key: 'nom_complet', label: 'Nom et prénoms (combinés)' },
    { key: 'nom', label: 'Nom (séparé)' },
    { key: 'prenoms', label: 'Prénoms (séparés)' },
    { key: 'sexe', label: 'Sexe (M ou F)' },
    { key: 'edition', label: 'Année de distinction / Édition' },
    { key: 'examen', label: 'Examen (CEP, BEPC, BAC)' },
    { key: 'commune', label: 'Commune représentée' },
    { key: 'etablissement', label: 'Établissement représenté' },
    { key: 'moyenne', label: 'Moyenne' },
    { key: 'rang', label: 'Rang ou classement communal' },
    { key: 'date_naissance_lieu', label: 'Date et lieu de naissance (combinés)' },
    { key: 'date_naissance', label: 'Date de naissance' },
    { key: 'lieu_naissance', label: 'Lieu de naissance' },
    { key: 'autres', label: 'Autres (Série, Mention, N° table)' },
    { key: 'contacts', label: 'Contact(s) / Téléphone' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setReport(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length > 0) {
          const headerRow = json[0].map((h) => String(h || '').trim());
          const rows = json.slice(1).filter((r) => r.some((c) => c !== undefined && c !== ''));

          setHeaders(headerRow);
          setRawRows(rows);

          // Détection automatique intelligente du mapping
          const autoMap: Record<string, string> = {};
          headerRow.forEach((h, colIdx) => {
            const hLower = h.toLowerCase();
            if (hLower.includes('nom') && hLower.includes('prénom')) autoMap[colIdx] = 'nom_complet';
            else if (hLower === 'nom') autoMap[colIdx] = 'nom';
            else if (hLower === 'prénom' || hLower === 'prenoms') autoMap[colIdx] = 'prenoms';
            else if (hLower.includes('sexe')) autoMap[colIdx] = 'sexe';
            else if (hLower.includes('examen')) autoMap[colIdx] = 'examen';
            else if (hLower.includes('année') || hLower.includes('distinction') || hLower.includes('edition')) autoMap[colIdx] = 'edition';
            else if (hLower.includes('commune')) autoMap[colIdx] = 'commune';
            else if (hLower.includes('etablissement') || hLower.includes('établissement')) autoMap[colIdx] = 'etablissement';
            else if (hLower.includes('moyenne')) autoMap[colIdx] = 'moyenne';
            else if (hLower.includes('classement') || hLower.includes('rang')) autoMap[colIdx] = 'rang';
            else if (hLower.includes('naissance')) autoMap[colIdx] = 'date_naissance_lieu';
            else if (hLower.includes('autre') || hLower.includes('série') || hLower.includes('serie')) autoMap[colIdx] = 'autres';
            else if (hLower.includes('contact') || hLower.includes('téléphone') || hLower.includes('tel')) autoMap[colIdx] = 'contacts';
          });
          setColumnMapping(autoMap);
        }
      } catch (error) {
        console.error('Erreur lecture fichier', error);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleLaunchImport = async () => {
    if (rawRows.length === 0 || isProcessing) return;

    setIsProcessing(true);
    try {
      const itemsToImport: Partial<Laureat>[] = rawRows.map((row) => {
        const obj: any = {};

        Object.entries(columnMapping).forEach(([colIdxStr, fieldKey]) => {
          const colIdx = Number(colIdxStr);
          const cellVal = row[colIdx];
          if (cellVal === undefined || cellVal === null) return;
          const valStr = String(cellVal).trim();

          if (fieldKey === 'nom_complet') {
            // Séparer Nom (première partie souvent majuscule) et Prénoms
            const parts = valStr.split(' ');
            if (parts.length > 1) {
              obj.nom = parts[0].toUpperCase();
              obj.prenoms = parts.slice(1).join(' ');
            } else {
              obj.nom = valStr.toUpperCase();
              obj.prenoms = '';
            }
          } else if (fieldKey === 'nom') {
            obj.nom = valStr.toUpperCase();
          } else if (fieldKey === 'prenoms') {
            obj.prenoms = valStr;
          } else if (fieldKey === 'sexe') {
            obj.sexe = valStr.toUpperCase().startsWith('F') ? 'F' : 'M';
          } else if (fieldKey === 'edition') {
            obj.edition = parseInt(valStr.replace(/[^0-9]/g, '')) || 2026;
          } else if (fieldKey === 'examen') {
            const up = valStr.toUpperCase();
            if (up.includes('CEP')) obj.examen = 'CEP';
            else if (up.includes('BEPC')) obj.examen = 'BEPC';
            else if (up.includes('BAC')) obj.examen = 'BAC';
            else obj.examen = valStr;
          } else if (fieldKey === 'commune') {
            obj.commune = valStr;
          } else if (fieldKey === 'etablissement') {
            obj.etablissement = valStr;
          } else if (fieldKey === 'moyenne') {
            obj.moyenne = parseFloat(valStr.replace(',', '.')) || 0;
          } else if (fieldKey === 'rang') {
            obj.rang = valStr;
          } else if (fieldKey === 'date_naissance_lieu') {
            if (valStr.includes(' - ')) {
              const parts = valStr.split(' - ');
              obj.dateNaissance = parts[0];
              obj.lieuNaissance = parts[1].replace(/^(Né|Née)\s+à\s+/i, '');
            } else {
              obj.dateNaissance = valStr;
            }
          } else if (fieldKey === 'autres') {
            obj.remarquesScolaires = valStr;
            if (valStr.includes('Série')) {
              const matchSerie = valStr.match(/Série\s+[A-Z0-9]+/i);
              if (matchSerie) obj.serie = matchSerie[0];
            }
            if (valStr.includes('Mention')) {
              const matchMention = valStr.match(/Mention\s+[A-Za-z\s]+/i);
              if (matchMention) obj.mention = matchMention[0];
            }
          } else if (fieldKey === 'contacts') {
            obj.telephone = valStr;
          }
        });

        // Valeurs par défaut indispensables
        if (!obj.departement) obj.departement = 'Borgou';
        if (!obj.typeEtablissement) obj.typeEtablissement = 'Public';
        if (obj.moyenne >= 16) obj.ordinateurRecu = true;

        return obj;
      });

      const res = await batchImportLaureats(itemsToImport, importMode);
      setReport(res);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'N°': 1,
        'Nom et prénoms': 'BIO Sabi Karim',
        'Sexe (M ou F)': 'M',
        'Examen (CEP ou BEPC ou BAC)': 'BAC',
        'Année de distinction': 2026,
        'Commune représentée': 'Nikki',
        'Moyenne': '17,25',
        'Classement communal ou rang': '1er',
        'Date de naissance (et lieu)': '15/05/2006 - Né à Nikki',
        'Etablissement représenté': 'CP Mont Carmel',
        'Autres (Série, Mention)': 'Série C - Mention Très Bien',
        'Contact(s)': 'Père : 0197455747',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Modèle_Importation');
    XLSX.writeFile(workbook, 'Modele_Importation_Laureats_Hysteresis.xlsx');
  };

  const downloadErrorReport = () => {
    if (!report || report.erreurs.length === 0) return;
    const content = report.erreurs.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rapport_Erreurs_Import_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* En-tête du module */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#ED5312] uppercase tracking-wider">
              Module d’Intégration de Données
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            Importation Sécurisée des Fichiers Excel (.xlsx) et CSV
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Importez de nouvelles cohortes de lauréats ou complétez la base existante sans perte d’information.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors shadow-2xs shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Télécharger le modèle Excel type</span>
        </button>
      </div>

      {/* Zone de Téléversement Drag & Drop */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs text-center">
        <label className="border-2 border-dashed border-slate-300 hover:border-[#ED5312] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-orange-50/30">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-[#ED5312] flex items-center justify-center mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-900">
            {fileName ? `Fichier sélectionné : ${fileName}` : 'Cliquez pour sélectionner un fichier Excel (.xlsx, .xls) ou CSV'}
          </span>
          <span className="text-xs text-slate-500 mt-1">
            Formats acceptés : Feuilles de calcul Excel, CSV exporté de Google Sheets ou SIGE
          </span>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Interface d'Association des Colonnes (Mapping) & Prévisualisation */}
      {headers.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                1. Correspondance des Colonnes ({headers.length} colonnes détectées)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Associez chaque colonne du fichier source au champ cible correspondant de l'application.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
              {rawRows.length} lignes à importer
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {headers.map((h, colIdx) => (
              <div key={colIdx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1 truncate">
                  Colonne source : <strong>{h || `Col ${colIdx + 1}`}</strong>
                </span>
                <select
                  value={columnMapping[colIdx] || ''}
                  onChange={(e) =>
                    setColumnMapping({ ...columnMapping, [colIdx]: e.target.value })
                  }
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-md font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
                >
                  <option value="">-- Ignorer cette colonne --</option>
                  {targetFields.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Arbitrage des Doublons */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 mb-2">
              2. Règle de Traitement des Doublons Détectés :
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className={`p-3 rounded-lg border cursor-pointer text-xs transition-colors ${importMode === 'completer_vides' ? 'bg-orange-50 border-[#ED5312] text-orange-950' : 'bg-slate-50 border-slate-200'}`}>
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'completer_vides'}
                  onChange={() => setImportMode('completer_vides')}
                  className="hidden"
                />
                <strong className="block mb-0.5">Fusionner (Recommandé)</strong>
                <span className="text-slate-500 text-[11px] leading-tight block">
                  Complète uniquement les champs vides sans jamais écraser de donnée existante.
                </span>
              </label>

              <label className={`p-3 rounded-lg border cursor-pointer text-xs transition-colors ${importMode === 'skip_doublons' ? 'bg-orange-50 border-[#ED5312] text-orange-950' : 'bg-slate-50 border-slate-200'}`}>
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'skip_doublons'}
                  onChange={() => setImportMode('skip_doublons')}
                  className="hidden"
                />
                <strong className="block mb-0.5">Ignorer les doublons</strong>
                <span className="text-slate-500 text-[11px] leading-tight block">
                  Passe la ligne si le lauréat existe déjà (même nom, édition et examen).
                </span>
              </label>

              <label className={`p-3 rounded-lg border cursor-pointer text-xs transition-colors ${importMode === 'ecraser_doublons' ? 'bg-orange-50 border-[#ED5312] text-orange-950' : 'bg-slate-50 border-slate-200'}`}>
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'ecraser_doublons'}
                  onChange={() => setImportMode('ecraser_doublons')}
                  className="hidden"
                />
                <strong className="block mb-0.5">Remplacer les anciennes données</strong>
                <span className="text-slate-500 text-[11px] leading-tight block">
                  Écrase la fiche cible avec les nouvelles données du fichier.
                </span>
              </label>
            </div>
          </div>

          {/* Bouton de confirmation */}
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              onClick={handleLaunchImport}
              disabled={isProcessing}
              className="px-6 py-2.5 bg-[#ED5312] hover:bg-[#D64307] text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-sm transition-colors disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isProcessing
                  ? 'Importation sécurisée en cours...'
                  : `Valider et importer les ${rawRows.length} lignes`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Rapport d'importation */}
      {report && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Rapport Final d’Importation
            </h3>
            {report.erreurs.length > 0 && (
              <button
                onClick={downloadErrorReport}
                className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-md text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger le rapport d’erreurs</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Lignes ajoutées</span>
              <strong className="text-2xl font-mono text-emerald-900">{report.ajoutes}</strong>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <span className="text-[10px] uppercase font-bold text-blue-700 block">Fiches fusionnées</span>
              <strong className="text-2xl font-mono text-blue-900">{report.fusionnes}</strong>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[10px] uppercase font-bold text-slate-700 block">Doublons ignorés</span>
              <strong className="text-2xl font-mono text-slate-900">{report.ignores}</strong>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <span className="text-[10px] uppercase font-bold text-red-700 block">Lignes rejetées</span>
              <strong className="text-2xl font-mono text-red-900">{report.erreurs.length}</strong>
            </div>
          </div>

          {report.erreurs.length > 0 && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-900 space-y-1 max-h-40 overflow-y-auto">
              <span className="font-bold block">Détail des anomalies :</span>
              {report.erreurs.map((err, i) => (
                <div key={i} className="text-[11px] font-mono">
                  · {err}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
