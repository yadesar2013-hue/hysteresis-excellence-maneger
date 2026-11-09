# Hystérésis Excellence Manager — Architecture et Plan d'Implémentation

Plateforme web de gestion, d'analyse et de valorisation des lauréats de la **Fondation Hystérésis** dans le cadre de la *« Journée de l’Excellence en milieu scolaire »* (éditions 2022 à 2026 et futures), intégrant le suivi post-lauréat, les Digit’ELLES Clubs, la détection des doublons et un moteur d'import/export avancé.

---

## Décisions Clés & Cadrage Validé

> [!IMPORTANT]
> Les options recommandées retenues pour le déploiement de cette version initiale garantissent une disponibilité immédiate et une totale autonomie opérationnelle sans dépendance externe bloquante :
>
> 1. **Persistance des données** : Stockage local structuré persistant (localStorage / IndexedDB) couplé à un système de sauvegarde/restauration JSON et un moteur d'import/export Excel (.xlsx) et CSV. Une architecture découplée prépare la synchronisation distante Cloud Firestore dès l'activation multi-utilisateurs.
> 2. **Jeu de données initial** : Préchargement direct des **111 lauréats réels** (2022 à 2026 : 34 CEP, 34 BEPC, 43 BAC ; 35 lauréates, 76 lauréats dans les 8 communes du Borgou) issus des listes officielles, avec bouton de réinitialisation sécurisé.
> 3. **Gestion des parcours multi-distinctions** : Détection et liaison automatique des lauréats primés plusieurs fois (ex. *ADANLIN Orel Bérenger*, BEPC 2023 #33 puis BAC 2026 #106) au sein d'une fiche d'excellence unifiée avec historique chronologique.
> 4. **Règles strictes Digit'ELLES Clubs** : Contrôle d'intégrité en temps réel plafonnant chaque club à 12 filles au total (maximum 3 filles par niveau : 3ᵉ, 2ⁿᵈᵉ, 1ʳᵉ, Tˡᵉ) avec alertes visuelles de surcapacité.

---

## 1. Vue d'Ensemble & Périmètre Fonctionnel

### A. Objectifs Métier
- **Centraliser & Sécuriser** : Fichier unique des 111 lauréats historiques du Borgou avec extension fluide pour les cohortes 2027+.
- **Import Intelligent** : Module d'import Excel/CSV avec prévisualisation, détection automatique des colonnes, règles de fusion et rapport d'anomalies.
- **Suivi Post-Lauréat & Mentorat** : Enregistrement des évolutions de carrière (élèves, étudiants, salariés, entrepreneurs), filières STEM et liste de relance proactive.
- **Digit’ELLES Clubs** : Structuration des clubs communaux, suivi des compétences numériques et détection automatique des jeunes instructrices.
- **Tableau de Bord Décisionnel** : Statistiques désagrégées par sexe, commune, examen, établissement et dotations (ordinateurs, bourses), avec carte schématique du Borgou.
- **Exports & Restitution** : Génération de listes filtrées (Excel, CSV) et de fiches de synthèse imprimables/PDF, incluant un mode anonymisé pour partenaires et bailleurs.

### B. Utilisateurs Cibles & Rôles
1. **Administrateur** : Accès total, configuration des référentiels, import/export complet, gestion des utilisateurs et réinitialisation de la base.
2. **Gestionnaire de programme** : Ajout/modification des lauréats, gestion du suivi et des relances, consultation des statistiques complètes.
3. **Responsable de Digit’ELLES Club** : Consultation des membres de son club, suivi des présences, ateliers et projets.
4. **Partenaire / Bailleur (Mode Lecteur)** : Statistiques globales et visualisations d'impact avec masquage automatique des coordonnées personnelles (téléphone, e-mail).

---

## 2. Expérience Utilisateur & Design Visuel

### A. Charte Graphique & Identité Hystérésis
- **Couleur Primaire** : Orange Fondation `#ED5312` (actions clés, sélection active, accentuation).
- **Surfaces & Fond** : Fond blanc `#FFFFFF` et gris clair `#F8FAFC` pour un confort de lecture prolongé.
- **Typographie** : `Plus Jakarta Sans` pour les titres et la navigation ; `Public Sans` pour les données denses ; `font-mono tabular-nums` pour les moyennes, rangs et numéros de téléphone.
- **En-tête Institutionnel** : 
  * *Fondation Hystérésis*
  * *Journée de l’Excellence en milieu scolaire*
- **Discipline Anti-Slop** : Aucune étiquette pillule superflue sur les métadonnées statiques, contrastes WCAG AA respectés, hiérarchie claire et aérée.

### B. Parcours Utilisateur & Arborescence

```
┌────────────────────────────────────────────────────────────────────────┐
│               Hystérésis Excellence Manager (Header fixe)              │
│  Fondation Hystérésis · Journée de l'Excellence · Sélecteur de Rôle    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                                                               ▼
┌─────────────────────────┐                     ┌───────────────────────────────┐
│  Navigation Latérale    │                     │  Zone de Travail Principale   │
│  - Tableau de bord      │                     │  (Vues dynamiques réactives)  │
│  - Répertoire lauréats  ├────────────────────►│  - Filtres multicritères      │
│  - Ajouter un lauréat   │                     │  - Grille de données dense    │
│  - Importateur fichier  │                     │  - Fiches détaillées 8 onglets│
│  - Doublons & Parcours  │                     │  - Module Digit'ELLES Clubs   │
│  - Suivi & Relances     │                     │  - Statistiques Borgou        │
│  - Digit'ELLES Clubs    │                     │  - Gestionnaire Référentiels  │
│  - Référentiels Borgou  │                     │  - Journal des modifications  │
│  - Rapports & Exports   │                     └───────────────────────────────┘
└─────────────────────────┘
```

---

## 3. Schéma de Données Détaillé

### A. Entité Principale : `Laureat`
```typescript
interface Laureat {
  // Identification
  id: string; // Identifiant unique généré
  numeroOrigine?: number; // N° d'ordre du fichier d'origine (1 à 111)
  nom: string; // Nom de famille en majuscules (ex: ADANLIN)
  prenoms: string; // Prénoms (ex: Orel Bérenger)
  sexe: 'F' | 'M';
  dateNaissance?: string; // YYYY-MM-DD si disponible
  lieuNaissance?: string; // Ex: Bembéréké, Parakou, Nikki
  photoUrl?: string; // Optionnelle
  telephone?: string; // Numéro formaté béninois
  telephoneLibelle?: string; // "Père", "Mère", "Lui-même", "Directrice"
  email?: string;
  contactUrgence?: string;

  // Données Scolaires au moment de la distinction
  edition: number; // 2022, 2023, 2024, 2025, 2026, ...
  examen: 'CEP' | 'BEPC' | 'BAC' | 'Autre';
  commune: string; // Bembéréké, Kalalé, Nikki, N'Dali, Parakou, Pèrèrè, Sinendé, Tchaourou
  arrondissement?: string;
  departement: string; // "Borgou" (extensible)
  etablissement: string; // Ex: CP Mont Carmel, Prytanée Militaire, CEG1 Kalalé
  typeEtablissement: 'Public' | 'Privé' | 'Militaire';
  moyenne: number; // Ex: 18.44
  rang: string; // Ex: "1er", "2ème", "1er ex aequo", "1ère (fille)", "1er (garçon)"
  serie?: string; // Ex: "Série C", "Série D", "Série A2", "Série F3"
  mention?: string; // Ex: "Mention Bien", "Mention Très Bien"
  moyenneEntreeSixieme?: number; // Pour les lauréats CEP
  numeroTable?: string; // Ex: "22C00387"
  remarquesScolaires?: string; // Provenance village, admissions PMB, etc.

  // Récompenses & Dotations
  ordinateurRecu: boolean;
  tabletteRecue: boolean;
  bourseRecue: boolean;
  accompagnementRecu?: string;
  dateRemise?: string;
  lieuRemise?: string;
  partenaireAssocie?: string;

  // Suivi Post-Lauréat
  statutActuel: 'Élève' | 'Étudiant(e)' | 'Salarié(e)' | 'Entrepreneur(e)' | 'En recherche' | 'Inconnu';
  etablissementActuel?: string;
  filiereActuelle?: string;
  communeActuelle?: string;
  orientationStem: 'Oui' | 'Non' | 'Inconnue';
  dateDernierContact?: string;
  statutRelance: 'À jour' | 'À relancer' | 'Sans contact' | 'Traité';
  motifRelance?: string;
  prochaineAction?: string;
  responsableSuivi?: string;

  // Digit'ELLES Club
  membreClub: boolean;
  clubCommune?: string;
  clubNiveau?: '3ème' | 'Seconde' | 'Première' | 'Terminale';
  roleClub?: 'Membre' | 'Jeune Instructrice' | 'Déléguée';

  // Administration & Qualité
  statutFiche: 'Active' | 'À vérifier' | 'Archivée';
  tauxCompletude: number; // 0 à 100%
  dateCreation: string;
  dateModification: string;
  sourceInformation: string;
  notesInternes?: string;
  parcoursLiesIds?: string[]; // Référence vers d'autres distinctions (ex: BEPC + BAC)
}
```

### B. Entité `DigitEllesClub`
- `id`, `nomClub`, `commune`, `etablissementRattache`, `responsableNom`, `responsableContact`.
- Quotas contrôlés :
  - `maxMembres` : 12 filles
  - `maxParNiveau` : 3 filles pour chaque niveau (3ᵉ, 2ⁿᵈᵉ, 1ʳᵉ, Tˡᵉ).
  - Statut : `Nominal`, `Complet`, `Alerte surcapacité`.

---

## 4. Architecture des Modules & Composants

```
src/
├── types/
│   └── laureat.ts            # Définitions TypeScript strictes (Laureat, Club, Filtres)
├── data/
│   ├── initialLaureats.ts    # Base exhaustive des 111 lauréats 2022-2026 préchargés
│   └── referentielsBorgou.ts # Communes, établissements scolaires, séries, mentions
├── utils/
│   ├── parser.ts             # Découpage dates/lieux, normalisation noms, contacts
│   ├── completude.ts         # Moteur de calcul du score de complétude (0-100%)
│   ├── duplicates.ts         # Détection doublons stricts vs parcours multi-examens
│   └── exportUtils.ts        # Générateurs CSV, XLSX et PDF/impression
├── context/
│   └── AppContext.tsx        # État global persistant, gestion des rôles, journal d'actions
├── components/
│   ├── layout/
│   │   ├── Header.tsx        # En-tête officiel Fondation Hystérésis & sélecteur de rôle
│   │   └── Sidebar.tsx       # Navigation latérale moderne avec badges réactifs
│   ├── dashboard/
│   │   ├── StatsOverview.tsx # KPIs globaux (Total, Filles, Ordinateurs, Suivis)
│   │   ├── BorgouMapChart.tsx# Carte schématique interactive des 8 communes du Borgou
│   │   ├── ExamDistribution.tsx # Graphiques Recharts (CEP, BEPC, BAC, Séries)
│   │   └── AlertsWidget.tsx  # Fiches incomplètes, alertes clubs, lauréats à relancer
│   ├── laureates/
│   │   ├── LaureateTable.tsx # Grille dense avec pagination, tri, sélection de colonnes
│   │   ├── LaureateFilters.tsx # Filtres combinables (Édition, Sexe, Commune, Examen)
│   │   ├── LaureateDetailModal.tsx # Fiche complète 8 onglets avec impression/PDF
│   │   └── LaureateFormModal.tsx # Formulaire ajout/édition avec validation & report d'édition
│   ├── import/
│   │   ├── FileUpload.tsx    # Drag & drop Excel (.xlsx, .xls) et CSV
│   │   ├── ColumnMapper.tsx  # Mapping visuel des colonnes avec suggestions intelligentes
│   │   └── ImportReport.tsx  # Bilan d'importation, gestion des doublons et export erreurs
│   ├── duplicates/
│   │   └── DuplicateManager.tsx # Résolution doublons et fusion des parcours multi-examens
│   ├── followUp/
│   │   └── FollowUpManager.tsx # File « À relancer », journal des contacts et mentorat
│   ├── clubs/
│   │   └── DigitEllesManager.tsx # Gestion des clubs, vérification de la règle des 12 filles
│   └── settings/
│       ├── ReferentielsView.tsx # Gestion des collèges/lycées, communes, séries
│       └── BackupRestore.tsx   # Sauvegarde JSON, réinitialisation de la base
└── App.tsx
```

---

## 5. Fonctionnalités Détaillées par Étape

### Étape 1 : Socle et Navigation
- En-tête officiel avec l'Orange Fondation `#ED5312`.
- Navigation latérale réactive, badge de compteur dynamique (111 lauréats).
- Sélecteur de rôle utilisateur pour tester instantanément les 4 modes d'accès (Admin, Gestionnaire, Responsable Club, Partenaire).

### Étape 2 : Tableau de Bord & Statistiques Borgou
- Cartes statistiques globales fidèles aux chiffres validés :
  - **111 Lauréats au total** (dont **35 filles**, soit 31.5%) ;
  - **34 CEP, 34 BEPC, 43 BAC** ;
  - Répartition par commune (Nikki, Kalalé, Bembéréké, Parakou, Sinendé, N'Dali, Pèrèrè, Tchaourou).
- Graphiques interactifs Recharts : Évolution temporelle 2022-2026, parité de genre, répartition par série au BAC (D, C, A2, etc.).

### Étape 3 : Répertoire & Recherche Multi-critères
- Barre de recherche instantanée (recherche par nom, prénom, établissement, contact, numéro de table, etc.).
- Filtres combinables par facettes (Édition, Examen, Commune, Sexe, Orientation STEM, Statut de relance).
- Grille avec tri par colonne, pagination fluide et sélecteur de colonnes visibles.

### Étape 4 : Fiche Détail 8 Onglets & Formulaire d'Ajout
- Fiche détaillée du lauréat :
  1. *Profil Général* (identité, photo de remplacement, contacts vérifiés) ;
  2. *Parcours Scolaire* (examen, établissement, moyenne, mention, rang) ;
  3. *Récompenses* (dotations, ordinateur, attestation) ;
  4. *Suivi Post-Lauréat* (statut actuel, filière, STEM) ;
  5. *Digit’ELLES Club* (intégration et rôle) ;
  6. *Mentorat & Contacts* ;
  7. *Historique & Complétude* (jauge de 0 à 100%) ;
  8. *Notes & Documents*.
- Formulaire d'ajout/édition avec sauvegarde de brouillon et bouton exclusif : **« Ajouter un lauréat à l'édition suivante »** qui préremplit intelligemment la fiche.

### Étape 5 : Importateur Excel / CSV
- Prise en charge des fichiers `.xlsx`, `.xls` et `.csv`.
- Table de correspondance interactive des colonnes avec prévisualisation des 5 premières lignes.
- Détection des colonnes obligatoires manquantes et arbitrage des doublons (Ignorer, Fusionner, Remplacer).

### Étape 6 : Gestion des Doublons & Parcours d'Excellence
- Détection automatique du cas remarquable du fichier : *ADANLIN Orel Bérenger* (BEPC 2023 et BAC 2026).
- Possibilité d'associer deux fiches d'examen pour un même élève pour retracer sa trajectoire d'excellence.

### Étape 7 : Module Digit’ELLES Clubs
- Suivi des clubs scolaires avec contrôle strict : **12 filles maximum (3 par niveau : 3ᵉ, 2ⁿᵈᵉ, 1ʳᵉ, Tˡᵉ)**.
- Alerte immédiate en cas de dépassement d'effectif ou de déséquilibre de niveau.

### Étape 8 : Suivi, Relances & Exports
- Module de gestion des rappels avec statuts *À jour*, *À relancer*, *Sans contact*.
- Moteur d'exportation Excel et CSV des résultats filtrés.
- Mode rapport pour bailleurs et partenaires avec anonymisation automatique des coordonnées privées (RGPD/APDP).

---

## 6. Vérification & Contrôle Qualité
- Vérification du rendu et des performances avec 111 enregistrements réels et architecture scalable jusqu'à 5 000+ fiches.
- Validation rigoureuse via `compile_applet` et `lint_applet` sans aucune régression.
