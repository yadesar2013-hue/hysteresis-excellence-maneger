/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ExamenType = 'CEP' | 'BEPC' | 'BAC' | 'Autre';
export type SexeType = 'F' | 'M';
export type StatutFicheType = 'Active' | 'À vérifier' | 'Archivée';
export type StatutActuelType = 'Élève' | 'Étudiant(e)' | 'Salarié(e)' | 'Entrepreneur(e)' | 'En recherche' | 'Inconnu';
export type StatutRelanceType = 'À jour' | 'À relancer' | 'Sans contact' | 'Traité';
export type RoleClubType = 'Membre' | 'Jeune Instructrice' | 'Déléguée' | 'Responsable';
export type UserRole = 'admin' | 'manager' | 'club_lead' | 'partner';

export interface ContactItem {
  type: string; // Ex: "Père", "Mère", "Lui-même", "Directrice", "Oncle"
  numero: string;
  isWhatsapp?: boolean;
}

export interface Laureat {
  // Identification
  id: string;
  numeroOrigine?: number; // 1 à 111 de la liste originale
  nom: string;
  prenoms: string;
  sexe: SexeType;
  dateNaissance?: string; // YYYY-MM-DD
  lieuNaissance?: string; // Ex: Bembéréké, Parakou, Nikki...
  photoUrl?: string;
  telephone?: string; // Téléphone principal formaté
  telephoneLibelle?: string; // Type du contact principal (ex: "Père", "Mère", "Lui-même")
  contactsSecondaires?: ContactItem[];
  email?: string;
  contactUrgence?: string;

  // Scolarité lors de la distinction
  edition: number; // 2022, 2023, 2024, 2025, 2026, ...
  examen: ExamenType;
  commune: string; // Bembéréké, Kalalé, Nikki, N'Dali, Parakou, Pèrèrè, Sinendé, Tchaourou
  arrondissement?: string;
  departement: string; // Par défaut "Borgou"
  etablissement: string;
  typeEtablissement: 'Public' | 'Privé' | 'Militaire';
  moyenne: number; // Ex: 18.44
  rang: string; // "1er", "2ème", "3ème", "1er ex aequo", "1ère (fille)", "1er (garçon)"
  serie?: string; // Série C, Série D, Série A2, Série F3, etc.
  mention?: string; // "Passable", "Assez Bien", "Bien", "Très Bien", "Excellente"
  moyenneEntreeSixieme?: number; // Pour le CEP (ex: 18.94)
  numeroTable?: string; // Ex: "22C00387"
  remarquesScolaires?: string; // Provenance village, admissions PMB, etc.
  certificatReference?: string;

  // Récompenses & Dotations
  ordinateurRecu: boolean;
  tabletteRecue: boolean;
  bourseRecue: boolean;
  naturePrix?: string;
  accompagnementRecu?: string;
  dateRemise?: string;
  lieuRemise?: string;
  partenaireAssocie?: string;
  observationRecompense?: string;

  // Suivi post-lauréat
  statutActuel: StatutActuelType;
  etablissementActuel?: string;
  filiereActuelle?: string;
  communeActuelle?: string;
  orientationStem: 'Oui' | 'Non' | 'Inconnue';
  dateDernierContact?: string;
  statutRelance: StatutRelanceType;
  motifRelance?: string;
  prochaineAction?: string;
  responsableSuivi?: string;
  mentorAttribue?: string;
  derniereActiviteSuivie?: string;
  besoinsActuels?: string;
  projetProfessionnel?: string;
  difficultesRencontrees?: string;
  commentairesSuivi?: string;

  // Digit'ELLES Club
  participationClub: boolean;
  clubCommune?: string;
  clubEtablissement?: string;
  clubNiveau?: '3ème' | 'Seconde' | 'Première' | 'Terminale';
  roleClub?: RoleClubType;
  projetsRealises?: string;
  participationHackathon?: boolean;

  // Données administratives et qualité
  statutFiche: StatutFicheType;
  tauxCompletude: number; // 0 - 100
  dateCreation: string;
  dateModification: string;
  utilisateurCreation: string;
  utilisateurModification: string;
  sourceInformation: string;
  consentementDonnees: boolean;
  autorisationPublicationPhoto: boolean;
  notesInternes?: string;
  parcoursLiesIds?: string[]; // Référence ID d'autres distinctions (ex: BEPC + BAC)
}

export interface DigitEllesClub {
  id: string;
  nom: string;
  commune: string;
  etablissement: string;
  anneeCreation: number;
  responsableNom: string;
  responsableContact: string;
  capaciteMax: number; // 12
  maxParNiveau: number; // 3
  description?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  utilisateur: string;
  action: 'CREATION' | 'MODIFICATION' | 'SUPPRESSION' | 'IMPORT' | 'EXPORT' | 'FUSION_DOUBLON';
  entite: string;
  details: string;
}

export interface FilterOptions {
  searchQuery: string;
  edition: string; // 'all' | '2022' | '2023' | ...
  examen: string; // 'all' | 'CEP' | 'BEPC' | 'BAC'
  sexe: string; // 'all' | 'F' | 'M'
  commune: string; // 'all' | 'Nikki' | ...
  etablissement: string; // 'all' | ...
  serie: string; // 'all' | 'D' | 'C' | 'A2' ...
  orientationStem: string; // 'all' | 'Oui' | 'Non' | 'Inconnue'
  participationClub: string; // 'all' | 'oui' | 'non'
  statutRelance: string; // 'all' | 'À relancer' | 'À jour' | 'Sans contact'
  statutFiche: string; // 'all' | 'Active' | 'À vérifier' | 'Archivée'
  minCompletude: number; // 0
  maxCompletude: number; // 100
  seulementFilles: boolean;
  seulementOrdinateurs: boolean;
}
