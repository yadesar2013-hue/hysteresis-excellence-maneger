/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const COMMUNES_BORGOU = [
  'Bembéréké',
  'Kalalé',
  'Nikki',
  "N'Dali",
  'Parakou',
  'Pèrèrè',
  'Sinendé',
  'Tchaourou',
] as const;

export const EXAMENS = ['CEP', 'BEPC', 'BAC'] as const;

export const SERIES_BAC = [
  'Série A1',
  'Série A2',
  'Série B',
  'Série C',
  'Série D',
  'Série E',
  'Série F3',
  'Série F4',
  'Série G2',
] as const;

export const MENTIONS = [
  'Passable',
  'Assez Bien',
  'Bien',
  'Très Bien',
  'Excellente',
] as const;

export const STATUTS_ACTUELS = [
  'Élève',
  'Étudiant(e)',
  'Salarié(e)',
  'Entrepreneur(e)',
  'En recherche',
  'Inconnu',
] as const;

export const ROLES_DIGITELLES = [
  'Membre',
  'Jeune Instructrice',
  'Déléguée',
  'Responsable',
] as const;

export const NIVEAUX_CLUB = [
  '3ème',
  'Seconde',
  'Première',
  'Terminale',
] as const;

export interface EtablissementRef {
  nom: string;
  commune: string;
  type: 'Public' | 'Privé' | 'Militaire';
}

export const ETABLISSEMENTS_INITIALS: EtablissementRef[] = [
  { nom: "Prytanée Militaire de Bembéréké (PMB)", commune: 'Bembéréké', type: 'Militaire' },
  { nom: "CEG INA", commune: 'Bembéréké', type: 'Public' },
  { nom: "Lycée Technique INA", commune: 'Bembéréké', type: 'Public' },
  { nom: "CEG BEROUBOUAY", commune: 'Bembéréké', type: 'Public' },
  { nom: "Col. Cath. Marie-Adélaïde / Bembéréké", commune: 'Bembéréké', type: 'Privé' },
  { nom: "L'EMINENCE", commune: 'Bembéréké', type: 'Privé' },
  { nom: "MARIE-ADELAIDE", commune: 'Bembéréké', type: 'Privé' },
  { nom: "LA GRACE", commune: 'Bembéréké', type: 'Privé' },

  { nom: "CEG1 Kalalé", commune: 'Kalalé', type: 'Public' },
  { nom: "CEG BOUKA / KALALÉ", commune: 'Kalalé', type: 'Public' },
  { nom: "CEG KALALE", commune: 'Kalalé', type: 'Public' },
  { nom: "CEG PÉONGA", commune: 'Kalalé', type: 'Public' },
  { nom: "CPEG MATER SALVATORI", commune: 'Kalalé', type: 'Privé' },
  { nom: "MATER SALVATORIS 1", commune: 'Kalalé', type: 'Privé' },
  { nom: "EPP / OUENAGOUROU", commune: 'Kalalé', type: 'Public' },
  { nom: "EPP GNEL-GOUISSA", commune: 'Kalalé', type: 'Public' },
  { nom: "SOUNON MONRA OUMAROU", commune: 'Kalalé', type: 'Public' },

  { nom: "CPEG MONT CARMEL", commune: 'Nikki', type: 'Privé' },
  { nom: "CPEG Saint Augustin de Nikki", commune: 'Nikki', type: 'Privé' },
  { nom: "CEG 2 Nikki", commune: 'Nikki', type: 'Public' },
  { nom: "CEG1 / Nikki", commune: 'Nikki', type: 'Public' },
  { nom: "MALAIKA DE SAINTE MARIE THERESE 1", commune: 'Nikki', type: 'Privé' },
  { nom: "BIRO / B", commune: 'Nikki', type: 'Public' },
  { nom: "EPP NIKKI / D", commune: 'Nikki', type: 'Public' },
  { nom: "EPP SAKABANSIJA", commune: 'Nikki', type: 'Public' },
  { nom: "LA ROYALE / NIKKI", commune: 'Nikki', type: 'Privé' },
  { nom: "SAINT GENIES / Nikki", commune: 'Nikki', type: 'Privé' },

  { nom: "CPEG MON AVENIR PLUS", commune: "N'Dali", type: 'Privé' },
  { nom: "CEG Sirarou / N'Dali", commune: "N'Dali", type: 'Public' },
  { nom: "CEG N'DALI", commune: "N'Dali", type: 'Public' },
  { nom: "EPP MON AVENIR", commune: "N'Dali", type: 'Privé' },
  { nom: "EPP SUANIN / A", commune: "N'Dali", type: 'Public' },
  { nom: "EPP TREBOUN / C", commune: "N'Dali", type: 'Public' },

  { nom: "CP Academia / Parakou", commune: 'Parakou', type: 'Privé' },
  { nom: "CPEG ST FRANCOIS DE SALES", commune: 'Parakou', type: 'Privé' },
  { nom: "CPEG Catholique Mgr Faroud", commune: 'Parakou', type: 'Privé' },
  { nom: "CEG Albarika", commune: 'Parakou', type: 'Public' },
  { nom: "CEG Zongo", commune: 'Parakou', type: 'Public' },
  { nom: "HIBISCUS 1er CYCLE", commune: 'Parakou', type: 'Privé' },
  { nom: "OSSENI ROUGA", commune: 'Parakou', type: 'Privé' },
  { nom: "LA MISERICORDE", commune: 'Parakou', type: 'Privé' },
  { nom: "LE PETIT GRAND", commune: 'Parakou', type: 'Privé' },

  { nom: "CEG 1 PERERE", commune: 'Pèrèrè', type: 'Public' },
  { nom: "CEG 2 PERERE", commune: 'Pèrèrè', type: 'Public' },
  { nom: "CEG NONSINA", commune: 'Pèrèrè', type: 'Public' },
  { nom: "EPP BARAWE", commune: 'Pèrèrè', type: 'Public' },
  { nom: "EPP KPATEKOU-DABA / A", commune: 'Pèrèrè', type: 'Public' },
  { nom: "CATHOLIQUE SAINT PAUL", commune: 'Pèrèrè', type: 'Privé' },

  { nom: "CEG SEKERE", commune: 'Sinendé', type: 'Public' },
  { nom: "CEG SINENDE", commune: 'Sinendé', type: 'Public' },
  { nom: "CEG Fô-Bouré", commune: 'Sinendé', type: 'Public' },
  { nom: "CEG NIARO", commune: 'Sinendé', type: 'Public' },
  { nom: "SAINT FRANCOIS COLL", commune: 'Sinendé', type: 'Privé' },
  { nom: "EPP DANRIGOUROU / B", commune: 'Sinendé', type: 'Public' },
  { nom: "LE MIRACLE", commune: 'Sinendé', type: 'Privé' },

  { nom: "Col. Cath. Père Georges HOUNYEME", commune: 'Tchaourou', type: 'Privé' },
  { nom: "CEG YEBESSI", commune: 'Tchaourou', type: 'Public' },
  { nom: "Lycée Technique Commercial et Industriel", commune: 'Tchaourou', type: 'Public' },
  { nom: "EPP KAKI-KOKA / B", commune: 'Tchaourou', type: 'Public' },
  { nom: "SAINTE THERESE DE L'ENFANT DE JESUS", commune: 'Tchaourou', type: 'Privé' },
];
