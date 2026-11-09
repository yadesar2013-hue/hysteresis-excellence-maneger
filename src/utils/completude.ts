/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Laureat } from '../types/laureat';

export interface CompletudeReport {
  score: number; // 0 à 100
  champsManquants: string[];
  champsAcompleter: string[];
  statut: 'Complet' | 'Satisfaisant' | 'Incomplet';
}

export function calculerCompletude(laureat: Partial<Laureat>): CompletudeReport {
  const champsManquants: string[] = [];
  const champsAcompleter: string[] = [];

  // Critères obligatoires (Poids fort : 40 points au total, 5 pts chacun)
  const champsObligatoires: { key: keyof Laureat; label: string }[] = [
    { key: 'nom', label: 'Nom' },
    { key: 'prenoms', label: 'Prénoms' },
    { key: 'sexe', label: 'Sexe' },
    { key: 'edition', label: 'Édition' },
    { key: 'examen', label: 'Examen' },
    { key: 'commune', label: 'Commune' },
    { key: 'departement', label: 'Département' },
    { key: 'etablissement', label: 'Établissement' },
  ];

  let scoreObligatoires = 0;
  for (const item of champsObligatoires) {
    const val = laureat[item.key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      scoreObligatoires += 5;
    } else {
      champsManquants.push(item.label);
    }
  }

  // Critères de distinction & résultats (Poids moyen : 35 points au total)
  const champsResultats: { key: keyof Laureat; label: string; points: number }[] = [
    { key: 'moyenne', label: 'Moyenne à l’examen', points: 10 },
    { key: 'rang', label: 'Rang ou distinction', points: 5 },
    { key: 'dateNaissance', label: 'Date de naissance', points: 5 },
    { key: 'lieuNaissance', label: 'Lieu de naissance', points: 5 },
    { key: 'telephone', label: 'Numéro de téléphone', points: 5 },
    { key: 'email', label: 'Adresse e-mail', points: 5 },
  ];

  let scoreResultats = 0;
  for (const item of champsResultats) {
    const val = laureat[item.key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      scoreResultats += item.points;
    } else {
      champsAcompleter.push(item.label);
    }
  }

  // Spécificité BAC
  if (laureat.examen === 'BAC') {
    if (!laureat.serie) {
      champsAcompleter.push('Série du BAC');
    }
  }

  // Critères de suivi et dotations (Poids : 25 points au total)
  let scoreSuivi = 0;
  if (laureat.ordinateurRecu || laureat.tabletteRecue || laureat.bourseRecue) {
    scoreSuivi += 8;
  } else {
    champsAcompleter.push('Informations sur les dotations');
  }

  if (laureat.statutActuel && laureat.statutActuel !== 'Inconnu') {
    scoreSuivi += 7;
  } else {
    champsAcompleter.push('Statut scolaire/professionnel actuel');
  }

  if (laureat.orientationStem && laureat.orientationStem !== 'Inconnue') {
    scoreSuivi += 5;
  } else {
    champsAcompleter.push('Orientation vers les filières STEM');
  }

  if (laureat.dateDernierContact) {
    scoreSuivi += 5;
  } else {
    champsAcompleter.push('Date du dernier contact de suivi');
  }

  const scoreTotal = Math.min(100, Math.round(scoreObligatoires + scoreResultats + scoreSuivi));

  let statut: 'Complet' | 'Satisfaisant' | 'Incomplet' = 'Incomplet';
  if (scoreTotal >= 90) statut = 'Complet';
  else if (scoreTotal >= 65) statut = 'Satisfaisant';

  return {
    score: scoreTotal,
    champsManquants,
    champsAcompleter,
    statut,
  };
}
