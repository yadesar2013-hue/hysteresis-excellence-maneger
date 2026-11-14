/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Timestamp, FieldValue } from 'firebase/firestore';
import { Laureat, DigitEllesClub } from '../types/laureat';

export function emailToInviteId(email: string): string {
  return email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .slice(0, 128);
}

export function sanitizeDocId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  return cleaned || `doc_${Date.now().toString(36)}`;
}

function clampString(val: string | undefined | null, maxLen: number): string | undefined {
  if (val === undefined || val === null) return undefined;
  const trimmed = String(val).trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLen);
}

export function formatTimestampToDate(val: unknown): string {
  if (!val) return new Date().toISOString().split('T')[0];
  if (val instanceof Timestamp) {
    return val.toDate().toISOString().split('T')[0];
  }
  if (typeof val === 'string') return val;
  return new Date().toISOString().split('T')[0];
}

export function formatTimestampToIso(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      clean[k] = v;
    }
  }
  return clean as T;
}

export function computeInitials(nom: string, prenoms: string): string {
  const n = (nom || '').trim().charAt(0).toUpperCase();
  const p = (prenoms || '').trim().charAt(0).toUpperCase();
  if (!n && !p) return 'L.';
  return `${n || '?'}.${p ? ` ${p}.` : ''}`.slice(0, 20);
}

export function splitLaureatForFirestore(
  laureat: Laureat,
  uid: string,
  createdAtVal: FieldValue | Timestamp,
  updatedAtVal: FieldValue | Timestamp
) {
  const id = sanitizeDocId(laureat.id);
  const initiales = computeInitials(laureat.nom, laureat.prenoms);

  const statsPayload = stripUndefined({
    id,
    numeroOrigine: typeof laureat.numeroOrigine === 'number' ? Math.round(laureat.numeroOrigine) : undefined,
    initiales,
    sexe: laureat.sexe === 'F' ? 'F' : 'M',
    edition: Math.min(2100, Math.max(2020, Math.round(Number(laureat.edition) || 2026))),
    examen: laureat.examen || 'Autre',
    commune: clampString(laureat.commune, 80) || 'Non renseigné',
    departement: clampString(laureat.departement, 80) || 'Borgou',
    etablissement: clampString(laureat.etablissement, 200) || 'Non renseigné',
    typeEtablissement: laureat.typeEtablissement || 'Public',
    moyenne: Math.min(20, Math.max(0, Number(laureat.moyenne) || 0)),
    rang: clampString(laureat.rang, 60) || '1er',
    serie: clampString(laureat.serie, 50),
    mention: clampString(laureat.mention, 50),
    moyenneEntreeSixieme:
      typeof laureat.moyenneEntreeSixieme === 'number'
        ? Math.min(20, Math.max(0, laureat.moyenneEntreeSixieme))
        : undefined,
    ordinateurRecu: Boolean(laureat.ordinateurRecu),
    tabletteRecue: Boolean(laureat.tabletteRecue),
    bourseRecue: Boolean(laureat.bourseRecue),
    statutActuel: laureat.statutActuel || 'Élève',
    orientationStem: laureat.orientationStem || 'Inconnue',
    participationClub: Boolean(laureat.participationClub),
    clubCommune: laureat.participationClub ? clampString(laureat.clubCommune, 80) : undefined,
    clubNiveau: laureat.participationClub ? laureat.clubNiveau : undefined,
    roleClub: laureat.participationClub ? laureat.roleClub : undefined,
    statutRelance: laureat.statutRelance || 'À jour',
    statutFiche: laureat.statutFiche || 'Active',
    tauxCompletude: Math.min(100, Math.max(0, Math.round(Number(laureat.tauxCompletude) || 0))),
    parcoursLiesIds: Array.isArray(laureat.parcoursLiesIds)
      ? laureat.parcoursLiesIds.slice(0, 10)
      : undefined,
    createdBy: uid,
    createdAt: createdAtVal,
    updatedAt: updatedAtVal,
  });

  const privatePayload = stripUndefined({
    id,
    nom: clampString(laureat.nom, 120) || 'NON RENSEIGNÉ',
    prenoms: clampString(laureat.prenoms, 160) || 'Non renseigné',
    dateNaissance: clampString(laureat.dateNaissance, 30),
    lieuNaissance: clampString(laureat.lieuNaissance, 120),
    photoUrl: clampString(laureat.photoUrl, 500),
    telephone: clampString(laureat.telephone, 60),
    telephoneLibelle: clampString(laureat.telephoneLibelle, 60),
    contactsSecondaires: Array.isArray(laureat.contactsSecondaires)
      ? laureat.contactsSecondaires.slice(0, 10)
      : undefined,
    email: clampString(laureat.email, 200),
    contactUrgence: clampString(laureat.contactUrgence, 160),
    arrondissement: clampString(laureat.arrondissement, 100),
    numeroTable: clampString(laureat.numeroTable, 50),
    remarquesScolaires: clampString(laureat.remarquesScolaires, 500),
    certificatReference: clampString(laureat.certificatReference, 100),
    naturePrix: clampString(laureat.naturePrix, 200),
    accompagnementRecu: clampString(laureat.accompagnementRecu, 200),
    dateRemise: clampString(laureat.dateRemise, 40),
    lieuRemise: clampString(laureat.lieuRemise, 150),
    partenaireAssocie: clampString(laureat.partenaireAssocie, 150),
    observationRecompense: clampString(laureat.observationRecompense, 400),
    etablissementActuel: clampString(laureat.etablissementActuel, 200),
    filiereActuelle: clampString(laureat.filiereActuelle, 150),
    communeActuelle: clampString(laureat.communeActuelle, 100),
    dateDernierContact: clampString(laureat.dateDernierContact, 40),
    motifRelance: clampString(laureat.motifRelance, 300),
    prochaineAction: clampString(laureat.prochaineAction, 300),
    responsableSuivi: clampString(laureat.responsableSuivi, 120),
    mentorAttribue: clampString(laureat.mentorAttribue, 120),
    derniereActiviteSuivie: clampString(laureat.derniereActiviteSuivie, 200),
    besoinsActuels: clampString(laureat.besoinsActuels, 400),
    projetProfessionnel: clampString(laureat.projetProfessionnel, 400),
    difficultesRencontrees: clampString(laureat.difficultesRencontrees, 400),
    commentairesSuivi: clampString(laureat.commentairesSuivi, 600),
    clubEtablissement: clampString(laureat.clubEtablissement, 200),
    projetsRealises: clampString(laureat.projetsRealises, 400),
    participationHackathon:
      laureat.participationHackathon !== undefined ? Boolean(laureat.participationHackathon) : undefined,
    utilisateurCreation: clampString(laureat.utilisateurCreation, 120),
    utilisateurModification: clampString(laureat.utilisateurModification, 120),
    sourceInformation: clampString(laureat.sourceInformation, 200) || 'Plateforme Hystérésis',
    consentementDonnees: Boolean(laureat.consentementDonnees ?? true),
    autorisationPublicationPhoto: Boolean(laureat.autorisationPublicationPhoto ?? false),
    notesInternes: clampString(laureat.notesInternes, 2000),
    createdBy: uid,
    createdAt: createdAtVal,
    updatedAt: updatedAtVal,
  });

  return { id, statsPayload, privatePayload };
}

export function mergeLaureatFromFirestore(
  stats: Record<string, any>,
  priv?: Record<string, any>
): Laureat {
  const initiales = stats.initiales || 'L.';
  return {
    id: stats.id,
    numeroOrigine: stats.numeroOrigine,
    nom: priv?.nom || initiales,
    prenoms: priv?.prenoms || '(Anonymisé)',
    sexe: stats.sexe,
    dateNaissance: priv?.dateNaissance,
    lieuNaissance: priv?.lieuNaissance,
    photoUrl: priv?.photoUrl,
    telephone: priv?.telephone,
    telephoneLibelle: priv?.telephoneLibelle,
    contactsSecondaires: priv?.contactsSecondaires,
    email: priv?.email,
    contactUrgence: priv?.contactUrgence,
    edition: stats.edition,
    examen: stats.examen,
    commune: stats.commune,
    arrondissement: priv?.arrondissement,
    departement: stats.departement,
    etablissement: stats.etablissement,
    typeEtablissement: stats.typeEtablissement,
    moyenne: stats.moyenne,
    rang: stats.rang,
    serie: stats.serie,
    mention: stats.mention,
    moyenneEntreeSixieme: stats.moyenneEntreeSixieme,
    numeroTable: priv?.numeroTable,
    remarquesScolaires: priv?.remarquesScolaires,
    certificatReference: priv?.certificatReference,
    ordinateurRecu: Boolean(stats.ordinateurRecu),
    tabletteRecue: Boolean(stats.tabletteRecue),
    bourseRecue: Boolean(stats.bourseRecue),
    naturePrix: priv?.naturePrix,
    accompagnementRecu: priv?.accompagnementRecu,
    dateRemise: priv?.dateRemise,
    lieuRemise: priv?.lieuRemise,
    partenaireAssocie: priv?.partenaireAssocie,
    observationRecompense: priv?.observationRecompense,
    statutActuel: stats.statutActuel,
    etablissementActuel: priv?.etablissementActuel,
    filiereActuelle: priv?.filiereActuelle,
    communeActuelle: priv?.communeActuelle,
    orientationStem: stats.orientationStem,
    dateDernierContact: priv?.dateDernierContact,
    statutRelance: stats.statutRelance,
    motifRelance: priv?.motifRelance,
    prochaineAction: priv?.prochaineAction,
    responsableSuivi: priv?.responsableSuivi,
    mentorAttribue: priv?.mentorAttribue,
    derniereActiviteSuivie: priv?.derniereActiviteSuivie,
    besoinsActuels: priv?.besoinsActuels,
    projetProfessionnel: priv?.projetProfessionnel,
    difficultesRencontrees: priv?.difficultesRencontrees,
    commentairesSuivi: priv?.commentairesSuivi,
    participationClub: Boolean(stats.participationClub),
    clubCommune: stats.clubCommune,
    clubEtablissement: priv?.clubEtablissement,
    clubNiveau: stats.clubNiveau,
    roleClub: stats.roleClub,
    projetsRealises: priv?.projetsRealises,
    participationHackathon: priv?.participationHackathon,
    statutFiche: stats.statutFiche,
    tauxCompletude: stats.tauxCompletude,
    dateCreation: formatTimestampToDate(stats.createdAt),
    dateModification: formatTimestampToDate(stats.updatedAt),
    utilisateurCreation: priv?.utilisateurCreation || stats.createdBy || 'Système',
    utilisateurModification: priv?.utilisateurModification || 'Système',
    sourceInformation: priv?.sourceInformation || 'Base cloud sécurisée',
    consentementDonnees: priv?.consentementDonnees ?? true,
    autorisationPublicationPhoto: priv?.autorisationPublicationPhoto ?? false,
    notesInternes: priv?.notesInternes,
    parcoursLiesIds: stats.parcoursLiesIds,
  };
}

export function clubToFirestorePayload(
  club: DigitEllesClub,
  createdAtVal?: FieldValue | Timestamp,
  updatedAtVal?: FieldValue | Timestamp
) {
  return stripUndefined({
    id: sanitizeDocId(club.id),
    nom: clampString(club.nom, 150) || "Digit'ELLES Club",
    commune: clampString(club.commune, 80) || 'Borgou',
    etablissement: clampString(club.etablissement, 200) || 'Établissement scolaire',
    anneeCreation: Math.min(2100, Math.max(2020, Math.round(Number(club.anneeCreation) || 2025))),
    responsableNom: clampString(club.responsableNom, 120),
    responsableContact: clampString(club.responsableContact, 60),
    capaciteMax: Math.min(12, Math.max(1, Math.round(Number(club.capaciteMax) || 12))),
    maxParNiveau: Math.min(3, Math.max(1, Math.round(Number(club.maxParNiveau) || 3))),
    description: clampString(club.description, 500),
    createdAt: createdAtVal,
    updatedAt: updatedAtVal,
  });
}
