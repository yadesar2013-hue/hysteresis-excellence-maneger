/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import {
  Laureat,
  DigitEllesClub,
  ActivityLog,
  UserRole,
  UserStatus,
  UserProfile,
  RoleInvite,
} from '../types/laureat';
import { calculerCompletude } from '../utils/completude';
import {
  emailToInviteId,
  sanitizeDocId,
  splitLaureatForFirestore,
  mergeLaureatFromFirestore,
  clubToFirestorePayload,
  formatTimestampToIso,
} from '../utils/firestoreMapper';

const BOOTSTRAP_ADMIN_EMAIL = 'fhysteresis@gmail.com';

interface AppContextType {
  authUser: User | null;
  userProfile: UserProfile | null;
  authLoading: boolean;
  dataLoading: boolean;
  isSeeding: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  laureats: Laureat[];
  clubs: DigitEllesClub[];
  currentRole: UserRole;
  logs: ActivityLog[];
  allUsers: UserProfile[];
  roleInvites: RoleInvite[];
  addLaureat: (
    laureat: Omit<Laureat, 'id' | 'dateCreation' | 'dateModification' | 'tauxCompletude'>
  ) => Promise<Laureat>;
  updateLaureat: (id: string, updates: Partial<Laureat>) => Promise<void>;
  deleteLaureat: (id: string, permanent?: boolean) => Promise<void>;
  restoreLaureat: (id: string) => Promise<void>;
  batchImportLaureats: (
    items: Partial<Laureat>[],
    mode: 'skip_doublons' | 'ecraser_doublons' | 'completer_vides' | 'importer_tout'
  ) => Promise<{ ajoutes: number; ignores: number; fusionnes: number; erreurs: string[] }>;
  relierParcours: (id1: string, id2: string) => Promise<void>;
  dissocierParcours: (id1: string, id2: string) => Promise<void>;
  updateClub: (id: string, updates: Partial<DigitEllesClub>) => Promise<void>;
  addClub: (club: Omit<DigitEllesClub, 'id'>) => Promise<void>;
  reinitialiserBase: () => Promise<void>;
  exporterSauvegardeJSON: () => void;
  importerSauvegardeJSON: (jsonString: string) => Promise<boolean>;
  inviteUserByEmail: (
    email: string,
    role: Exclude<UserRole, 'pending'>,
    clubCommune?: string
  ) => Promise<void>;
  deleteInvite: (inviteId: string) => Promise<void>;
  updateUserRoleAndStatus: (
    uid: string,
    role: UserRole,
    status: UserStatus,
    clubCommune?: string
  ) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [statsDocs, setStatsDocs] = useState<Record<string, Record<string, any>>>({});
  const [privateDocs, setPrivateDocs] = useState<Record<string, Record<string, any>>>({});
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [clubs, setClubs] = useState<DigitEllesClub[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [roleInvites, setRoleInvites] = useState<RoleInvite[]>([]);

  const autoSeedTriggeredRef = useRef(false);

  const currentRole: UserRole = userProfile?.status === 'active' ? userProfile.role : 'pending';

  const recordLog = useCallback(
    async (action: ActivityLog['action'], entite: string, details: string) => {
      if (!auth.currentUser || !userProfile || userProfile.status !== 'active') return;
      if (!['admin', 'manager', 'club_lead'].includes(userProfile.role)) return;

      const logId = sanitizeDocId(`log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
      try {
        await setDoc(doc(db, 'activity_logs', logId), {
          id: logId,
          timestamp: serverTimestamp(),
          utilisateur: (userProfile.displayName || userProfile.email || 'Utilisateur').slice(0, 120),
          userId: auth.currentUser.uid,
          action,
          entite: entite.slice(0, 160),
          details: details.slice(0, 500),
        });
      } catch (err) {
        console.error('Log write skipped:', err);
      }
    },
    [userProfile]
  );

  // 1. Authentification & Profil utilisateur vérifié côté serveur
  useEffect(() => {
    let unsubUserDoc: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubUserDoc) {
        unsubUserDoc();
        unsubUserDoc = undefined;
      }

      if (!user) {
        setAuthUser(null);
        setUserProfile(null);
        setStatsDocs({});
        setPrivateDocs({});
        setStatsLoaded(false);
        setClubs([]);
        setLogs([]);
        setAllUsers([]);
        setRoleInvites([]);
        autoSeedTriggeredRef.current = false;
        setAuthLoading(false);
        return;
      }

      setAuthUser(user);
      setAuthError(null);

      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          const email = (user.email || '').toLowerCase();
          const displayName = (user.displayName || email.split('@')[0] || 'Utilisateur').slice(0, 150);

          if (email === BOOTSTRAP_ADMIN_EMAIL && user.emailVerified) {
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              displayName,
              role: 'admin',
              status: 'active',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            await setDoc(doc(db, 'admins', user.uid), {
              uid: user.uid,
              email: user.email,
              grantedBy: user.uid,
              createdAt: serverTimestamp(),
            });
          } else {
            let assignedRole: UserRole = 'pending';
            let assignedStatus: UserStatus = 'pending';
            let clubCommune: string | undefined;

            if (email && user.emailVerified) {
              try {
                const inviteId = emailToInviteId(email);
                const inviteSnap = await getDoc(doc(db, 'role_invites', inviteId));
                if (inviteSnap.exists()) {
                  const inv = inviteSnap.data();
                  assignedRole = inv.role as UserRole;
                  assignedStatus = 'active';
                  clubCommune = inv.clubCommune;
                }
              } catch {
                // Pas d'invitation trouvée -> reste en pending
              }
            }

            const newProfile: Record<string, unknown> = {
              uid: user.uid,
              email: user.email || '',
              displayName,
              role: assignedRole,
              status: assignedStatus,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            if (clubCommune) {
              newProfile.clubCommune = clubCommune;
            }
            await setDoc(userRef, newProfile);
          }
        }

        unsubUserDoc = onSnapshot(
          userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const d = docSnap.data();
              setUserProfile({
                uid: d.uid,
                email: d.email,
                displayName: d.displayName,
                role: d.role,
                status: d.status,
                clubCommune: d.clubCommune,
                createdAt: formatTimestampToIso(d.createdAt),
                updatedAt: formatTimestampToIso(d.updatedAt),
              });
            }
            setAuthLoading(false);
          },
          (err) => {
            handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
          }
        );
      } catch (err) {
        console.error('Erreur initialisation profil:', err);
        setAuthError(
          'Impossible de vérifier votre profil utilisateur. Vérifiez votre connexion ou contactez un administrateur.'
        );
        setAuthLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubUserDoc) unsubUserDoc();
    };
  }, []);

  // 2. Abonnements temps réel Firestore selon les habilitations du rôle
  useEffect(() => {
    if (!authUser || !userProfile || userProfile.status !== 'active' || userProfile.role === 'pending') {
      return;
    }

    setDataLoading(true);
    const unsubs: (() => void)[] = [];

    // Tous les rôles actifs lisent les statistiques anonymisées
    const unsubStats = onSnapshot(
      collection(db, 'laureats_stats'),
      (snap) => {
        const next: Record<string, Record<string, any>> = {};
        snap.forEach((docSnap) => {
          next[docSnap.id] = docSnap.data();
        });
        setStatsDocs(next);
        setStatsLoaded(true);
        setDataLoading(false);
      },
      (err) => {
        setDataLoading(false);
        handleFirestoreError(err, OperationType.LIST, 'laureats_stats');
      }
    );
    unsubs.push(unsubStats);

    // Tous les rôles actifs lisent la liste des clubs
    const unsubClubs = onSnapshot(
      collection(db, 'clubs'),
      (snap) => {
        const next: DigitEllesClub[] = [];
        snap.forEach((docSnap) => {
          next.push(docSnap.data() as DigitEllesClub);
        });
        setClubs(next);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'clubs');
      }
    );
    unsubs.push(unsubClubs);

    // UNIQUEMENT Administrateur et Gestionnaire lisent les données personnelles (PII)
    if (userProfile.role === 'admin' || userProfile.role === 'manager') {
      const unsubPrivate = onSnapshot(
        collection(db, 'laureats_private'),
        (snap) => {
          const next: Record<string, Record<string, any>> = {};
          snap.forEach((docSnap) => {
            next[docSnap.id] = docSnap.data();
          });
          setPrivateDocs(next);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'laureats_private');
        }
      );
      unsubs.push(unsubPrivate);
    } else {
      setPrivateDocs({});
    }

    // UNIQUEMENT Administrateur lit les journaux d'audit, utilisateurs et invitations
    if (userProfile.role === 'admin') {
      const logsQuery = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(200));
      const unsubLogs = onSnapshot(
        logsQuery,
        (snap) => {
          const next: ActivityLog[] = [];
          snap.forEach((docSnap) => {
            const d = docSnap.data();
            next.push({
              id: d.id,
              timestamp: formatTimestampToIso(d.timestamp),
              utilisateur: d.utilisateur,
              action: d.action,
              entite: d.entite,
              details: d.details,
            });
          });
          setLogs(next);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'activity_logs');
        }
      );
      unsubs.push(unsubLogs);

      const unsubUsers = onSnapshot(
        collection(db, 'users'),
        (snap) => {
          const next: UserProfile[] = [];
          snap.forEach((docSnap) => {
            const d = docSnap.data();
            next.push({
              uid: d.uid,
              email: d.email,
              displayName: d.displayName,
              role: d.role,
              status: d.status,
              clubCommune: d.clubCommune,
              createdAt: formatTimestampToIso(d.createdAt),
              updatedAt: formatTimestampToIso(d.updatedAt),
            });
          });
          setAllUsers(next);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'users');
        }
      );
      unsubs.push(unsubUsers);

      const unsubInvites = onSnapshot(
        collection(db, 'role_invites'),
        (snap) => {
          const next: RoleInvite[] = [];
          snap.forEach((docSnap) => {
            const d = docSnap.data();
            next.push({
              id: docSnap.id,
              email: d.email,
              role: d.role,
              clubCommune: d.clubCommune,
              invitedBy: d.invitedBy,
              createdAt: formatTimestampToIso(d.createdAt),
            });
          });
          setRoleInvites(next);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'role_invites');
        }
      );
      unsubs.push(unsubInvites);
    }

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, [authUser, userProfile?.uid, userProfile?.role, userProfile?.status]);

  // Fusion en mémoire de laureats_stats + laureats_private (si autorisé)
  const laureats = useMemo(() => {
    return Object.values(statsDocs)
      .map((stats) => mergeLaureatFromFirestore(stats, privateDocs[stats.id]))
      .sort((a, b) => (a.numeroOrigine || 9999) - (b.numeroOrigine || 9999));
  }, [statsDocs, privateDocs]);

  // Fonction d'initialisation / réinitialisation de la base officielle (111 lauréats)
  const seedInitialData = useCallback(async () => {
    if (!auth.currentUser || userProfile?.role !== 'admin') return;
    setIsSeeding(true);
    try {
      const { INITIAL_LAUREATS, INITIAL_CLUBS } = await import('../data/initialLaureats');
      const uid = auth.currentUser.uid;
      const now = serverTimestamp();

      // Écrire les 111 lauréats par lots atomiques de 150 fiches (300 opérations max < 500)
      const CHUNK_SIZE = 150;
      for (let i = 0; i < INITIAL_LAUREATS.length; i += CHUNK_SIZE) {
        const chunk = INITIAL_LAUREATS.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        for (const item of chunk) {
          const existingStats = statsDocs[item.id];
          const createdVal = (existingStats?.createdAt as Timestamp) || now;
          const createdByVal = (existingStats?.createdBy as string) || uid;
          const { id, statsPayload, privatePayload } = splitLaureatForFirestore(
            item,
            createdByVal,
            createdVal,
            now
          );
          batch.set(doc(db, 'laureats_stats', id), statsPayload);
          batch.set(doc(db, 'laureats_private', id), privatePayload);
        }
        await batch.commit();
      }

      // Écrire les clubs initiaux
      const clubBatch = writeBatch(db);
      for (const club of INITIAL_CLUBS) {
        const payload = clubToFirestorePayload(club, now, now);
        clubBatch.set(doc(db, 'clubs', payload.id), payload);
      }
      await clubBatch.commit();

      await recordLog(
        'IMPORT',
        'Base officielle Borgou',
        'Initialisation sécurisée des 111 lauréats (2022-2026) et des 4 Digit’ELLES Clubs dans Firestore.'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'laureats_stats');
    } finally {
      setIsSeeding(false);
    }
  }, [userProfile?.role, statsDocs, recordLog]);

  // Amorçage automatique lors de la toute première connexion Administrateur sur base vide
  useEffect(() => {
    if (
      userProfile?.role === 'admin' &&
      userProfile?.status === 'active' &&
      statsLoaded &&
      Object.keys(statsDocs).length === 0 &&
      !autoSeedTriggeredRef.current &&
      !isSeeding
    ) {
      autoSeedTriggeredRef.current = true;
      seedInitialData();
    }
  }, [userProfile, statsLoaded, statsDocs, isSeeding, seedInitialData]);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      const code = err?.code as string | undefined;
      if (code === 'auth/unauthorized-domain') {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        setAuthError(
          `UNAUTHORIZED_DOMAIN:${host}`
        );
      } else if (code === 'auth/popup-closed-by-user') {
        setAuthError('La fenêtre de connexion Google a été fermée avant la fin de l’authentification.');
      } else if (code === 'auth/popup-blocked') {
        setAuthError('Le navigateur a bloqué la fenêtre de connexion Google. Veuillez autoriser les fenêtres contextuelles pour ce site.');
      } else {
        setAuthError(err?.message || 'Erreur lors de la connexion Google.');
      }
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const addLaureat = async (
    data: Omit<Laureat, 'id' | 'dateCreation' | 'dateModification' | 'tauxCompletude'>
  ): Promise<Laureat> => {
    if (!auth.currentUser) throw new Error('Authentification requise');
    const report = calculerCompletude(data);
    const nowStr = new Date().toISOString().split('T')[0];
    const newId = sanitizeDocId(`laureat_${data.edition}_${Date.now().toString(36)}`);
    const nouveau: Laureat = {
      ...data,
      id: newId,
      tauxCompletude: report.score,
      dateCreation: nowStr,
      dateModification: nowStr,
      utilisateurCreation: userProfile?.email || currentRole,
      utilisateurModification: userProfile?.email || currentRole,
    };

    const nowTs = serverTimestamp();
    const { id, statsPayload, privatePayload } = splitLaureatForFirestore(
      nouveau,
      auth.currentUser.uid,
      nowTs,
      nowTs
    );

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'laureats_stats', id), statsPayload);
      batch.set(doc(db, 'laureats_private', id), privatePayload);
      await batch.commit();
      await recordLog(
        'CREATION',
        `${nouveau.nom} ${nouveau.prenoms}`,
        `Ajout d'un lauréat (${nouveau.edition} - ${nouveau.examen} à ${nouveau.commune})`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `laureats_stats/${id}`);
    }
    return nouveau;
  };

  const updateLaureat = async (id: string, updates: Partial<Laureat>) => {
    if (!auth.currentUser) return;
    const existingLaureat = laureats.find((l) => l.id === id);
    const existingStats = statsDocs[id];
    const existingPriv = privateDocs[id];
    if (!existingLaureat || !existingStats) return;

    // Cas particulier Responsable de Club : mise à jour restreinte aux champs Digit'ELLES sur laureats_stats
    if (currentRole === 'club_lead') {
      try {
        const clubUpdates: Record<string, unknown> = {
          updatedAt: serverTimestamp(),
        };
        if (updates.participationClub !== undefined) clubUpdates.participationClub = updates.participationClub;
        if (updates.clubCommune !== undefined) clubUpdates.clubCommune = updates.clubCommune;
        if (updates.clubNiveau !== undefined) clubUpdates.clubNiveau = updates.clubNiveau;
        if (updates.roleClub !== undefined) clubUpdates.roleClub = updates.roleClub;

        await updateDoc(doc(db, 'laureats_stats', id), clubUpdates);
        await recordLog('MODIFICATION', `Membre Club #${id}`, 'Mise à jour affectation Digit’ELLES Club.');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `laureats_stats/${id}`);
      }
      return;
    }

    const merged: Laureat = {
      ...existingLaureat,
      ...updates,
      utilisateurModification: userProfile?.email || currentRole,
    };
    merged.tauxCompletude = calculerCompletude(merged).score;

    const nowTs = serverTimestamp();
    const { statsPayload, privatePayload } = splitLaureatForFirestore(
      merged,
      existingStats.createdBy || auth.currentUser.uid,
      existingStats.createdAt || nowTs,
      nowTs
    );

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'laureats_stats', id), statsPayload);
      if (existingPriv || currentRole === 'admin' || currentRole === 'manager') {
        const privCreatedBy = existingPriv?.createdBy || existingStats.createdBy || auth.currentUser.uid;
        const privCreatedAt = existingPriv?.createdAt || existingStats.createdAt || nowTs;
        batch.set(doc(db, 'laureats_private', id), {
          ...privatePayload,
          createdBy: privCreatedBy,
          createdAt: privCreatedAt,
        });
      }
      await batch.commit();
      await recordLog('MODIFICATION', `${merged.nom} ${merged.prenoms}`, 'Mise à jour des informations de la fiche.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `laureats_stats/${id}`);
    }
  };

  const deleteLaureat = async (id: string, permanent = false) => {
    const target = laureats.find((l) => l.id === id);
    if (!target) return;

    if (permanent) {
      try {
        const batch = writeBatch(db);
        batch.delete(doc(db, 'laureats_stats', id));
        batch.delete(doc(db, 'laureats_private', id));
        await batch.commit();
        await recordLog('SUPPRESSION', `${target.nom} ${target.prenoms}`, 'Suppression définitive de la fiche.');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `laureats_stats/${id}`);
      }
    } else {
      await updateLaureat(id, { statutFiche: 'Archivée' });
      await recordLog('SUPPRESSION', `${target.nom} ${target.prenoms}`, 'Fiche archivée (suppression logique).');
    }
  };

  const restoreLaureat = async (id: string) => {
    await updateLaureat(id, { statutFiche: 'Active' });
  };

  const relierParcours = async (id1: string, id2: string) => {
    const l1 = laureats.find((l) => l.id === id1);
    const l2 = laureats.find((l) => l.id === id2);
    if (!l1 || !l2) return;

    const lies1 = Array.from(new Set([...(l1.parcoursLiesIds || []), id2])).slice(0, 10);
    const lies2 = Array.from(new Set([...(l2.parcoursLiesIds || []), id1])).slice(0, 10);

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'laureats_stats', id1), { parcoursLiesIds: lies1, updatedAt: serverTimestamp() });
      batch.update(doc(db, 'laureats_stats', id2), { parcoursLiesIds: lies2, updatedAt: serverTimestamp() });
      await batch.commit();
      await recordLog(
        'FUSION_DOUBLON',
        'Parcours reliés',
        `Association des fiches ${l1.nom} (${l1.examen} ${l1.edition}) et ${l2.examen} ${l2.edition}.`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `laureats_stats/${id1}`);
    }
  };

  const dissocierParcours = async (id1: string, id2: string) => {
    const l1 = laureats.find((l) => l.id === id1);
    const l2 = laureats.find((l) => l.id === id2);
    if (!l1 || !l2) return;

    const lies1 = (l1.parcoursLiesIds || []).filter((id) => id !== id2);
    const lies2 = (l2.parcoursLiesIds || []).filter((id) => id !== id1);

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'laureats_stats', id1), { parcoursLiesIds: lies1, updatedAt: serverTimestamp() });
      batch.update(doc(db, 'laureats_stats', id2), { parcoursLiesIds: lies2, updatedAt: serverTimestamp() });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `laureats_stats/${id1}`);
    }
  };

  const batchImportLaureats = async (
    items: Partial<Laureat>[],
    mode: 'skip_doublons' | 'ecraser_doublons' | 'completer_vides' | 'importer_tout'
  ) => {
    if (!auth.currentUser) throw new Error('Authentification requise');
    let ajoutes = 0;
    let ignores = 0;
    let fusionnes = 0;
    const erreurs: string[] = [];
    const nowStr = new Date().toISOString().split('T')[0];
    const nowTs = serverTimestamp();
    const uid = auth.currentUser.uid;

    const toWrite: { laureat: Laureat; isNew: boolean }[] = [];
    const currentSnapshot = [...laureats];

    items.forEach((item, index) => {
      if (!item.nom || !item.prenoms || !item.edition || !item.examen) {
        erreurs.push(`Ligne ${index + 1} rejetée : Nom, Prénoms, Édition ou Examen manquant.`);
        return;
      }

      const matchIndex = currentSnapshot.findIndex(
        (ex) =>
          ex.nom.toLowerCase().trim() === (item.nom || '').toLowerCase().trim() &&
          ex.prenoms.toLowerCase().trim() === (item.prenoms || '').toLowerCase().trim() &&
          ex.edition === item.edition &&
          ex.examen === item.examen
      );

      if (matchIndex >= 0 && mode !== 'importer_tout') {
        if (mode === 'skip_doublons') {
          ignores++;
          return;
        } else if (mode === 'ecraser_doublons') {
          const merged = { ...currentSnapshot[matchIndex], ...item, dateModification: nowStr };
          merged.tauxCompletude = calculerCompletude(merged).score;
          toWrite.push({ laureat: merged as Laureat, isNew: false });
          fusionnes++;
          return;
        } else if (mode === 'completer_vides') {
          const current = currentSnapshot[matchIndex];
          const completed: any = { ...current };
          for (const key of Object.keys(item)) {
            const val = (item as any)[key];
            if (
              val !== undefined &&
              val !== null &&
              val !== '' &&
              ((current as any)[key] === undefined ||
                (current as any)[key] === null ||
                (current as any)[key] === '')
            ) {
              completed[key] = val;
            }
          }
          completed.dateModification = nowStr;
          completed.tauxCompletude = calculerCompletude(completed).score;
          toWrite.push({ laureat: completed as Laureat, isNew: false });
          fusionnes++;
          return;
        }
      }

      const newId = sanitizeDocId(`laureat_${item.edition}_${Date.now().toString(36)}_${index}`);
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
        dateCreation: nowStr,
        dateModification: nowStr,
        utilisateurCreation: userProfile?.email || currentRole,
        utilisateurModification: userProfile?.email || currentRole,
        sourceInformation: 'Importation fichier externe',
        consentementDonnees: true,
        autorisationPublicationPhoto: false,
      };
      toWrite.push({ laureat: complet, isNew: true });
      ajoutes++;
    });

    try {
      const CHUNK_SIZE = 150;
      for (let i = 0; i < toWrite.length; i += CHUNK_SIZE) {
        const chunk = toWrite.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        for (const entry of chunk) {
          const exStats = statsDocs[entry.laureat.id];
          const exPriv = privateDocs[entry.laureat.id];
          const createdBy = entry.isNew ? uid : exStats?.createdBy || uid;
          const createdAt = entry.isNew ? nowTs : exStats?.createdAt || nowTs;
          const { id, statsPayload, privatePayload } = splitLaureatForFirestore(
            entry.laureat,
            createdBy,
            createdAt,
            nowTs
          );
          batch.set(doc(db, 'laureats_stats', id), statsPayload);
          batch.set(doc(db, 'laureats_private', id), {
            ...privatePayload,
            createdBy: entry.isNew ? uid : exPriv?.createdBy || createdBy,
            createdAt: entry.isNew ? nowTs : exPriv?.createdAt || createdAt,
          });
        }
        await batch.commit();
      }

      await recordLog(
        'IMPORT',
        'Import de fichier',
        `${ajoutes} ajoutés, ${fusionnes} fusionnés, ${ignores} ignorés, ${erreurs.length} rejets.`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'laureats_stats');
    }

    return { ajoutes, ignores, fusionnes, erreurs };
  };

  const updateClub = async (id: string, updates: Partial<DigitEllesClub>) => {
    const existingClub = clubs.find((c) => c.id === id);
    if (!existingClub) return;

    try {
      const payload = clubToFirestorePayload(
        { ...existingClub, ...updates },
        undefined,
        serverTimestamp()
      );
      const { createdAt: _c, ...rest } = payload;
      await updateDoc(doc(db, 'clubs', id), rest);
      await recordLog('MODIFICATION', existingClub.nom, 'Mise à jour des informations du club.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `clubs/${id}`);
    }
  };

  const addClub = async (clubData: Omit<DigitEllesClub, 'id'>) => {
    const newId = sanitizeDocId(`club_${Date.now().toString(36)}`);
    const newClub: DigitEllesClub = { ...clubData, id: newId };
    try {
      const payload = clubToFirestorePayload(newClub, serverTimestamp(), serverTimestamp());
      await setDoc(doc(db, 'clubs', newId), payload);
      await recordLog('CREATION', clubData.nom, `Création d'un nouveau Digit'ELLES Club à ${clubData.commune}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `clubs/${newId}`);
    }
  };

  const reinitialiserBase = async () => {
    await seedInitialData();
  };

  const exporterSauvegardeJSON = () => {
    const data = {
      dateExport: new Date().toISOString(),
      version: '2.0-firebase',
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
    recordLog('EXPORT', 'Sauvegarde JSON', `Export JSON de ${laureats.length} fiches.`);
  };

  const importerSauvegardeJSON = async (jsonString: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.laureats)) {
        await batchImportLaureats(parsed.laureats, 'ecraser_doublons');
        await recordLog('IMPORT', 'Restauration JSON', 'Restauration depuis un fichier JSON.');
        return true;
      }
    } catch (e) {
      console.error('Erreur import JSON', e);
    }
    return false;
  };

  const inviteUserByEmail = async (
    email: string,
    role: Exclude<UserRole, 'pending'>,
    clubCommune?: string
  ) => {
    if (!auth.currentUser || currentRole !== 'admin') return;
    const cleanEmail = email.trim().toLowerCase();
    const inviteId = emailToInviteId(cleanEmail);
    const payload: Record<string, unknown> = {
      email: cleanEmail,
      role,
      invitedBy: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    };
    if (role === 'club_lead' && clubCommune) {
      payload.clubCommune = clubCommune;
    }

    try {
      await setDoc(doc(db, 'role_invites', inviteId), payload);
      await recordLog('ADMIN_ROLE', cleanEmail, `Invitation attribuée avec le rôle « ${role} ».`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `role_invites/${inviteId}`);
    }
  };

  const deleteInvite = async (inviteId: string) => {
    if (currentRole !== 'admin') return;
    try {
      await deleteDoc(doc(db, 'role_invites', inviteId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `role_invites/${inviteId}`);
    }
  };

  const updateUserRoleAndStatus = async (
    uid: string,
    role: UserRole,
    status: UserStatus,
    clubCommune?: string
  ) => {
    if (!auth.currentUser || currentRole !== 'admin') return;
    const targetUser = allUsers.find((u) => u.uid === uid);

    try {
      const updates: Record<string, unknown> = {
        role,
        status,
        updatedAt: serverTimestamp(),
      };
      if (clubCommune) {
        updates.clubCommune = clubCommune;
      }

      const batch = writeBatch(db);
      batch.update(doc(db, 'users', uid), updates);

      if (role === 'admin' && status === 'active' && targetUser) {
        batch.set(doc(db, 'admins', uid), {
          uid,
          email: targetUser.email,
          grantedBy: auth.currentUser.uid,
          createdAt: serverTimestamp(),
        });
      } else if (targetUser && targetUser.email.toLowerCase() !== BOOTSTRAP_ADMIN_EMAIL) {
        batch.delete(doc(db, 'admins', uid));
      }

      await batch.commit();
      await recordLog(
        'ADMIN_ROLE',
        targetUser?.email || uid,
        `Statut modifié : rôle « ${role} », état « ${status} ».`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  return (
    <AppContext.Provider
      value={{
        authUser,
        userProfile,
        authLoading,
        dataLoading,
        isSeeding,
        authError,
        signInWithGoogle,
        signOut,
        laureats,
        clubs,
        currentRole,
        logs,
        allUsers,
        roleInvites,
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
        inviteUserByEmail,
        deleteInvite,
        updateUserRoleAndStatus,
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
