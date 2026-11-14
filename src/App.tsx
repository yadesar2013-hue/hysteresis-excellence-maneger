/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar, TabKey } from './components/layout/Sidebar';
import { StatsOverview } from './components/dashboard/StatsOverview';
import { BorgouMapChart } from './components/dashboard/BorgouMapChart';
import { ExamDistribution } from './components/dashboard/ExamDistribution';
import { LaureateFilters } from './components/laureates/LaureateFilters';
import { LaureateTable } from './components/laureates/LaureateTable';
import { LaureateDetailModal } from './components/laureates/LaureateDetailModal';
import { LaureateFormModal } from './components/laureates/LaureateFormModal';
import { FileImporter } from './components/import/FileImporter';
import { DuplicateManager } from './components/duplicates/DuplicateManager';
import { FollowUpManager } from './components/followUp/FollowUpManager';
import { DigitEllesManager } from './components/clubs/DigitEllesManager';
import { ReferentielsView } from './components/settings/ReferentielsView';
import { ActivityLogsView } from './components/logs/ActivityLogsView';
import { HelpModal } from './components/help/HelpModal';
import { LoginView } from './components/auth/LoginView';
import { UsersRolesView } from './components/users/UsersRolesView';
import { Laureat, FilterOptions } from './types/laureat';
import { Loader2, Trash2, X } from 'lucide-react';

const DEFAULT_FILTERS: FilterOptions = {
  searchQuery: '',
  edition: 'all',
  examen: 'all',
  sexe: 'all',
  commune: 'all',
  etablissement: 'all',
  serie: 'all',
  orientationStem: 'all',
  participationClub: 'all',
  statutRelance: 'all',
  statutFiche: 'all',
  minCompletude: 0,
  maxCompletude: 100,
  seulementFilles: false,
  seulementOrdinateurs: false,
};

const DEFAULT_COLUMNS = [
  'numeroOrigine',
  'nom',
  'sexe',
  'edition',
  'examen',
  'commune',
  'etablissement',
  'moyenne',
  'rang',
  'serie',
  'telephone',
  'dotations',
  'statutActuel',
  'completude',
];

const MainContent: React.FC = () => {
  const {
    authUser,
    userProfile,
    authLoading,
    dataLoading,
    isSeeding,
    currentRole,
    laureats,
    deleteLaureat,
  } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_COLUMNS);

  // Modals state
  const [selectedLaureat, setSelectedLaureat] = useState<Laureat | null>(null);
  const [editingLaureat, setEditingLaureat] = useState<Laureat | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null);

  // Filtrage réactif des lauréats
  const filteredLaureats = useMemo(() => {
    return laureats.filter((l) => {
      // Recherche globale multi-champs
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchNom = l.nom.toLowerCase().includes(q);
        const matchPrenoms = l.prenoms.toLowerCase().includes(q);
        const matchEtab = l.etablissement.toLowerCase().includes(q);
        const matchCommune = l.commune.toLowerCase().includes(q);
        const matchSerie = (l.serie || '').toLowerCase().includes(q);
        const matchTel = (l.telephone || '').includes(q);
        const matchTable = (l.numeroTable || '').toLowerCase().includes(q);
        const matchMention = (l.mention || '').toLowerCase().includes(q);

        if (
          !matchNom &&
          !matchPrenoms &&
          !matchEtab &&
          !matchCommune &&
          !matchSerie &&
          !matchTel &&
          !matchTable &&
          !matchMention
        ) {
          return false;
        }
      }

      if (filters.edition !== 'all' && String(l.edition) !== filters.edition) return false;
      if (filters.examen !== 'all' && l.examen !== filters.examen) return false;
      if (filters.sexe !== 'all' && l.sexe !== filters.sexe) return false;
      if (filters.commune !== 'all' && l.commune.toLowerCase() !== filters.commune.toLowerCase()) return false;
      if (filters.orientationStem !== 'all' && l.orientationStem !== filters.orientationStem) return false;
      if (filters.statutRelance !== 'all' && l.statutRelance !== filters.statutRelance) return false;
      if (filters.statutFiche !== 'all' && l.statutFiche !== filters.statutFiche) return false;

      if (filters.seulementFilles && l.sexe !== 'F') return false;
      if (filters.seulementOrdinateurs && !l.ordinateurRecu) return false;

      return true;
    });
  }, [laureats, filters]);

  // 1. Chargement initial de la session Firebase
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-slate-600 gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#ED5312] text-white flex items-center justify-center font-black text-xl shadow-sm">
          H
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Loader2 className="w-4 h-4 animate-spin text-[#ED5312]" />
          <span>Vérification sécurisée de votre session...</span>
        </div>
      </div>
    );
  }

  // 2. Barrière d'authentification et de validation du rôle
  if (!authUser || !userProfile || userProfile.status !== 'active' || currentRole === 'pending') {
    return <LoginView />;
  }

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleCommuneClickFromDashboard = (commune: string) => {
    setFilters({ ...filters, commune });
    setActiveTab('laureats');
  };

  const handleExamenClickFromDashboard = (examen: string) => {
    setFilters({ ...filters, examen });
    setActiveTab('laureats');
  };

  const handleFilterFillesFromDashboard = () => {
    setFilters({ ...filters, sexe: 'F' });
    setActiveTab('laureats');
  };

  const handleFilterRelanceFromDashboard = () => {
    setFilters({ ...filters, statutRelance: 'À relancer' });
    setActiveTab('laureats');
  };

  const handleNavigateToLaureatById = (id: string) => {
    const target = laureats.find((l) => l.id === id);
    if (target) {
      setSelectedLaureat(target);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <Header onOpenHelp={() => setShowHelp(true)} />

      {/* Bandeau d'initialisation ou de chargement Firestore */}
      {(isSeeding || dataLoading) && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 text-xs text-orange-900 flex items-center justify-center gap-2 font-medium">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ED5312]" />
          <span>
            {isSeeding
              ? 'Initialisation de la base officielle des 111 lauréats (2022–2026) dans Firestore...'
              : 'Synchronisation sécurisée des données en cours...'}
          </span>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'add') {
              setIsAddingNew(true);
            } else {
              setActiveTab(tab);
            }
          }}
        />

        <main className="flex-1 p-4 lg:p-7 max-w-7xl mx-auto w-full space-y-6">
          {/* VUE 1 : TABLEAU DE BORD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in">
              <StatsOverview
                onFilterCommune={handleCommuneClickFromDashboard}
                onFilterExamen={handleExamenClickFromDashboard}
                onFilterFilles={handleFilterFillesFromDashboard}
                onFilterARelancer={handleFilterRelanceFromDashboard}
              />
              <BorgouMapChart onSelectCommune={handleCommuneClickFromDashboard} />
              <ExamDistribution />
            </div>
          )}

          {/* VUE 2 : RÉPERTOIRE DES LAURÉATS */}
          {activeTab === 'laureats' && (
            <div className="space-y-4 animate-in fade-in">
              <LaureateFilters
                filters={filters}
                onChangeFilters={setFilters}
                onResetFilters={() => setFilters(DEFAULT_FILTERS)}
                totalFiltered={filteredLaureats.length}
                totalAll={laureats.length}
                visibleColumns={visibleColumns}
                onToggleColumn={toggleColumn}
              />

              <LaureateTable
                laureats={filteredLaureats}
                visibleColumns={visibleColumns}
                onSelectLaureat={(laureat) => setSelectedLaureat(laureat)}
                onEditLaureat={(laureat) => setEditingLaureat(laureat)}
                onDeleteLaureat={(id) => setArchiveTargetId(id)}
              />
            </div>
          )}

          {/* VUE 3 : IMPORTATEUR FICHIER */}
          {activeTab === 'import' && (currentRole === 'admin' || currentRole === 'manager') && (
            <div className="animate-in fade-in">
              <FileImporter />
            </div>
          )}

          {/* VUE 4 : DOUBLONS & TRAJECTOIRES MULTI-EXAMENS */}
          {activeTab === 'duplicates' && (currentRole === 'admin' || currentRole === 'manager') && (
            <div className="animate-in fade-in">
              <DuplicateManager onSelectLaureat={(laureat) => setSelectedLaureat(laureat)} />
            </div>
          )}

          {/* VUE 5 : SUIVI POST-LAURÉAT */}
          {activeTab === 'followup' && (
            <div className="animate-in fade-in">
              <FollowUpManager onSelectLaureat={(laureat) => setSelectedLaureat(laureat)} />
            </div>
          )}

          {/* VUE 6 : DIGIT'ELLES CLUBS */}
          {activeTab === 'clubs' && (
            <div className="animate-in fade-in">
              <DigitEllesManager onSelectLaureat={(laureat) => setSelectedLaureat(laureat)} />
            </div>
          )}

          {/* VUE 7 : RÉFÉRENTIELS BORGOU */}
          {activeTab === 'referentiels' && (currentRole === 'admin' || currentRole === 'manager') && (
            <div className="animate-in fade-in">
              <ReferentielsView />
            </div>
          )}

          {/* VUE 8 : UTILISATEURS ET RÔLES (ADMIN) */}
          {activeTab === 'users' && currentRole === 'admin' && (
            <div className="animate-in fade-in">
              <UsersRolesView />
            </div>
          )}

          {/* VUE 9 : JOURNAL D'ACTIVITÉS */}
          {activeTab === 'logs' && currentRole === 'admin' && (
            <div className="animate-in fade-in">
              <ActivityLogsView />
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1 : FICHE DÉTAILLÉE 8 ONGLETS */}
      {selectedLaureat && (
        <LaureateDetailModal
          laureat={selectedLaureat}
          onClose={() => setSelectedLaureat(null)}
          onEdit={(laureat) => {
            setSelectedLaureat(null);
            setEditingLaureat(laureat);
          }}
          onNavigateToLaureat={handleNavigateToLaureatById}
        />
      )}

      {/* MODAL 2 : FORMULAIRE D'ÉDITION */}
      {editingLaureat && (
        <LaureateFormModal
          initialData={editingLaureat}
          onClose={() => setEditingLaureat(null)}
          onSuccess={(saved) => {
            setEditingLaureat(null);
            setSelectedLaureat(saved);
          }}
        />
      )}

      {/* MODAL 3 : FORMULAIRE D'AJOUT NOUVEAU LAURÉAT */}
      {isAddingNew && (
        <LaureateFormModal
          initialData={null}
          onClose={() => setIsAddingNew(false)}
          onSuccess={(saved) => {
            setIsAddingNew(false);
            setSelectedLaureat(saved);
          }}
        />
      )}

      {/* MODAL 4 : GUIDE D'UTILISATION */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* MODAL 5 : CONFIRMATION ARCHIVAGE FICHE */}
      {archiveTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                onClick={() => setArchiveTargetId(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-3">
              Archiver cette fiche de lauréat ?
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              La fiche passera au statut « Archivée » tout en conservant son historique dans Firestore.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setArchiveTargetId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  const target = archiveTargetId;
                  setArchiveTargetId(null);
                  await deleteLaureat(target, false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-xs"
              >
                Confirmer l’archivage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
