/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Laureat, DigitEllesClub, ActivityLog, UserRole } from '../types/laureat';
import { INITIAL_LAUREATS, INITIAL_CLUBS } from '../data/initialLaureats';
import { calculerCompletude } from '../utils/completude';

interface AppContextType {
  laureats: Laureat[];
  clubs: DigitEllesClub[];
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  logs: ActivityLog[];
  addLaureat: (laureat: Omit<Laureat, 'id' | 'dateCreation' | 'dateModification' | 'tauxCompletude'>) => Laureat;
  updateLaureat: (id: string, updates: Partial<Laureat>) => void;
  deleteLaureat: (id: string, permanent?: boolean) => void;
  restoreLaureat: (id: string) => void;
  batchImportLaureats: (
    items: Partial<Laureat>[],
    mode: 'skip_doublons' | 'ecraser_doublons' | 'completer_vides' | 'importer_tout'
  ) => { ajoutes: number; ignores: number; fusionnes: number; erreurs: string[] };
  relierParcours: (id1: string, id2: string) => void;
  dissocierParcours: (id1: string, id2: string) => void;
  updateClub: (id: string, updates: Partial<DigitEllesClub>) => void;
  addClub: (club: Omit<DigitEllesClub, 'id'>) => void;
  reinitialiserBase: () => void;
  exporterSauvegardeJSON: () => void;
  importerSauvegardeJSON: (jsonString: string) => boolean;
}

const STORAGE_KEY_LAUREATS = 'hysteresis_laureats_v1';
const STORAGE_KEY_CLUBS = 'hysteresis_clubs_v1';
const STORAGE_KEY_LOGS = 'hysteresis_logs_v1';
const STORAGE_KEY_ROLE = 'hysteresis_role_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [laureats, setLaureats] = useState<Laureat[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LAUREATS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_LAUREATS;
  });

  const [clubs, setClubs] = useState<DigitEllesClub[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLUBS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_CLUBS;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem(STORAGE_KEY_ROLE) as UserRole) || 'admin';
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'log-init',
        timestamp: new Date().toISOString(),
        utilisateur: 'Système',
        action: 'IMPORT',
        entite: 'Base initiale Borgou',
        details: '111 lauréats des promotions 2022 à 2026 chargés avec succès.',
      },
    ];
  });

  // Sauvegarde dans localStorage à chaque modification
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LAUREATS, JSON.stringify(laureats));
    } catch (e) {
      console.error('Erreur sauvegarde laureats', e);
    }
  }, [laureats]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CLUBS, JSON.stringify(clubs));
    } catch (e) {
      console.error('Erreur sauvegarde clubs', e);
    }
  }, [clubs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Erreur sauvegarde logs', e);
    }
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ROLE, currentRole);
  }, [currentRole]);

  const addLog = (action: ActivityLog['action'], entite: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      utilisateur: currentRole === 'admin' ? 'Administrateur' : currentRole === 'manager' ? 'Gestionnaire' : 'Responsable Club',
      action,
      entite,
      details,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 199)]);
  };

  const addLaureat = (data: Omit<Laureat, 'id' | 'dateCreation' | 'dateModification' | 'tauxCompletude'>): Laureat => {
    const report = calculerCompletude(data);
    const now = new Date().toISOString().split('T')[0];
    const newId = `laureat-${data.edition}-${Date.now().toString(36)}`;
    const nouveau: Laureat = {
      ...data,
      id: newId,
      tauxCompletude: report.score,
      dateCreation: now,
      dateModification: now,
      utilisateurCreation: currentRole,
      utilisateurModification: currentRole,
    };

    setLaureats((prev) => [nouveau, ...prev]);
    addLog('CREATION', `${nouveau.nom} ${nouveau.prenoms}`, `Ajout d'un lauréat (${nouveau.edition} - ${nouveau.examen} à ${nouveau.commune})`);
    return nouveau;
  };

  const updateLaureat = (id: string, updates: Partial<Laureat>) => {
    setLaureats((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const merged = { ...item, ...updates };
          const report = calculerCompletude(merged);
          const updated: Laureat = {
            ...merged,
            tauxCompletude: report.score,
            dateModification: new Date().toISOString().split('T')[0],
            utilisateurModification: currentRole,
          };
          return updated;
        }
        return item;
      })
    );
    addLog('MODIFICATION', `Lauréat #${id}`, `Mise à jour des informations de la fiche.`);
  };

  const deleteLaureat = (id: string, permanent = false) => {
    const target = laureats.find((l) => l.id === id);
    if (!target) return;

    if (permanent) {
      setLaureats((prev) => prev.filter((l) => l.id !== id));
      addLog('SUPPRESSION', `${target.nom} ${target.prenoms}`, `Suppression définitive de la fiche.`);
    } else {
      // Suppression logique (Archivage)
      updateLaureat(id, { statutFiche: 'Archivée' });
      addLog('SUPPRESSION', `${target.nom} ${target.prenoms}`, `Fiche archivée (suppression logique).`);
    }
  };

  const restoreLaureat = (id: string) => {
    updateLaureat(id, { statutFiche: 'Active' });
    addLog('MODIFICATION', `Lauréat #${id}`, `Fiche restaurée en statut actif.`);
  };

  const relierParcours = (id1: string, id2: string) => {
    setLaureats((prev) =>
      prev.map((l) => {
        if (l.id === id1) {
          const lies = Array.from(new Set([...(l.parcoursLiesIds || []), id2]));
          return { ...l, parcoursLiesIds: lies };
        }
        if (l.id === id2) {
          const lies = Array.from(new Set([...(l.parcoursLiesIds || []), id1]));
          return { ...l, parcoursLiesIds: lies };
        }
        return l;
      })
    );
    addLog('FUSION_DOUBLON', `Parcours reliés`, `Association des fiches ${id1} et ${id2} en parcours d'excellence.`);
  };

  const dissocierParcours = (id1: string, id2: string) => {
    setLaureats((prev) =>
      prev.map((l) => {
        if (l.id === id1) {
          return { ...l, parcoursLiesIds: (l.parcoursLiesIds || []).filter((id) => id !== id2) };
        }
        if (l.id === id2) {
          return { ...l, parcoursLiesIds: (l.parcoursLiesIds || []).filter((id) => id !== id1) };
        }
        return l;
      })
    );
  };

  const batchImportLaureats = (
    items: Partial<Laureat>[],
    mode: 'skip_doublons' | 'ecraser_doublons' | 'completer_vides' | 'importer_tout'
  ) => {
    let ajoutes = 0;
    let ignores = 0;
    let fusionnes = 0;
    const erreurs: string[] = [];
    const now = new Date().toISOString().split('T')[0];

    const updatedList = [...laureats];

    items.forEach((item, index) => {
      if (!item.nom || !item.prenoms || !item.edition || !item.examen) {
        erreurs.push(`Ligne ${index + 1} rejetée : Nom, Prénoms, Édition ou Examen manquant.`);
        return;
      }

      const matchIndex = updatedList.findIndex(
        (ex) =>
          ex.nom.toLowerCase().trim() === (item.nom || '').toLowerCase().trim() &&
          ex.prenoms.toLowerCase().trim() === (item.prenoms || '').toLowerCase().trim() &&
          ex.edition === item.edition &&
          ex.examen === item.examen
      );

      if (matchIndex >= 0) {
        // Doublon strict existant
        if (mode === 'skip_doublons') {
          ignores++;
          return;
        } else if (mode === 'ecraser_doublons') {
          const merged = { ...updatedList[matchIndex], ...item, dateModification: now };
          const rep = calculerCompletude(merged);
          merged.tauxCompletude = rep.score;
          updatedList[matchIndex] = merged as Laureat;
          fusionnes++;
          return;
        } else if (mode === 'completer_vides') {
          const current = updatedList[matchIndex];
          const completed: any = { ...current };
          for (const key of Object.keys(item)) {
            const val = (item as any)[key];
            if (val !== undefined && val !== null && val !== '' && ((current as any)[key] === undefined || (current as any)[key] === null || (current as any)[key] === '')) {
              completed[key] = val;
            }
          }
          completed.dateModification = now;
          completed.tauxCompletude = calculerCompletude(completed).score;
          updatedList[matchIndex] = completed as Laureat;
          fusionnes++;
          return;
        }
      }

      // Nouvel ajout
      const newId = `laureat-${item.edition}-${Date.now().toString(36)}-${index}`;
      const rep = calculerCompletude(item);
      const complet: Laureat = {
        id: newId,
        nom: item.nom.toUpperCase().trim(),
        prenoms: item.prenoms.trim(),
        sexe: item.sexe || 'M',
        edition: Number(item.edition),
        examen: item.examen,
        commune: item.commune || 'Borgou',
        departement: item.departement || 'Borgou',
        etablissement: item.etablissement || 'Non renseigné',
        typeEtablissement: item.typeEtablissement || 'Public',
        moyenne: Number(item.moyenne) || 0,
        rang: item.rang || '1er',
        dateNaissance: item.dateNaissance,
        lieuNaissance: item.lieuNaissance,
        telephone: item.telephone,
        telephoneLibelle: item.telephoneLibelle,
        serie: item.serie,
        mention: item.mention,
        remarquesScolaires: item.remarquesScolaires,
        ordinateurRecu: Boolean(item.ordinateurRecu),
        tabletteRecue: Boolean(item.tabletteRecue),
        bourseRecue: Boolean(item.bourseRecue),
        statutActuel: item.statutActuel || 'Élève',
        orientationStem: item.orientationStem || 'Inconnue',
        participationClub: Boolean(item.participationClub),
        clubCommune: item.clubCommune,
        clubNiveau: item.clubNiveau,
        roleClub: item.roleClub,
        statutRelance: item.statutRelance || 'À jour',
        statutFiche: 'Active',
        tauxCompletude: rep.score,
        dateCreation: now,
        dateModification: now,
        utilisateurCreation: currentRole,
        utilisateurModification: currentRole,
        sourceInformation: 'Importation fichier externe',
        consentementDonnees: true,
        autorisationPublicationPhoto: false,
      };

      updatedList.push(complet);
      ajoutes++;
    });

    setLaureats(updatedList);
    addLog('IMPORT', 'Import de fichier', `${ajoutes} ajoutés, ${fusionnes} fusionnés, ${ignores} ignorés, ${erreurs.length} rejets.`);
    return { ajoutes, ignores, fusionnes, erreurs };
  };

  const updateClub = (id: string, updates: Partial<DigitEllesClub>) => {
    setClubs((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    addLog('MODIFICATION', `Club #${id}`, `Mise à jour des informations du club.`);
  };

  const addClub = (clubData: Omit<DigitEllesClub, 'id'>) => {
    const newClub: DigitEllesClub = {
      ...clubData,
      id: `club-${Date.now().toString(36)}`,
    };
    setClubs((prev) => [...prev, newClub]);
    addLog('CREATION', clubData.nom, `Création d'un nouveau Digit'ELLES Club à ${clubData.commune}.`);
  };

  const reinitialiserBase = () => {
    setLaureats(INITIAL_LAUREATS);
    setClubs(INITIAL_CLUBS);
    addLog('IMPORT', 'Réinitialisation', 'Restauration complète de la base initiale officielle des 111 lauréats.');
  };

  const exporterSauvegardeJSON = () => {
    const data = {
      dateExport: new Date().toISOString(),
      version: '1.0',
      laureats,
      clubs,
      logs,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sauvegarde_Hysteresis_Manager_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importerSauvegardeJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.laureats)) {
        setLaureats(parsed.laureats);
        if (Array.isArray(parsed.clubs)) setClubs(parsed.clubs);
        if (Array.isArray(parsed.logs)) setLogs(parsed.logs);
        addLog('IMPORT', 'Restauration JSON', 'Restauration réussie depuis un fichier de sauvegarde JSON.');
        return true;
      }
    } catch (e) {
      console.error('Erreur import JSON', e);
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        laureats,
        clubs,
        currentRole,
        setCurrentRole,
        logs,
        addLaureat,
        updateLaureat,
        deleteLaureat,
        restoreLaureat,
        batchImportLaureats,
        relierParcours,
        dissocierParcours,
        updateClub,
        addClub,
        reinitialiserBase,
        exporterSauvegardeJSON,
        importerSauvegardeJSON,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp doit être utilisé au sein d un AppProvider');
  }
  return context;
};
