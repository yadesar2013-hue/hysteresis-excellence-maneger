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
import { Laureat, FilterOptions } from './types/laureat';

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
  const { laureats, deleteLaureat } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_COLUMNS);

  // Modals state
  const [selectedLaureat, setSelectedLaureat] = useState<Laureat | null>(null);
  const [editingLaureat, setEditingLaureat] = useState<Laureat | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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

      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar activeTab={activeTab} onSelectTab={(tab) => {
          if (tab === 'add') {
            setIsAddingNew(true);
          } else {
            setActiveTab(tab);
          }
        }} />

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
                onDeleteLaureat={(id) => {
                  if (window.confirm('Voulez-vous archiver cette fiche de lauréat ?')) {
                    deleteLaureat(id, false);
                  }
                }}
              />
            </div>
          )}

          {/* VUE 3 : IMPORTATEUR FICHIER */}
          {activeTab === 'import' && (
            <div className="animate-in fade-in">
              <FileImporter />
            </div>
          )}

          {/* VUE 4 : DOUBLONS & TRAJECTOIRES MULTI-EXAMENS */}
          {activeTab === 'duplicates' && (
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
          {activeTab === 'referentiels' && (
            <div className="animate-in fade-in">
              <ReferentielsView />
            </div>
          )}

          {/* VUE 8 : JOURNAL D'ACTIVITÉS */}
          {activeTab === 'logs' && (
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
