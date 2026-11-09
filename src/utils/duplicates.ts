/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Laureat } from '../types/laureat';

export function normaliserTexte(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');
}

export interface DuplicateGroup {
  id: string;
  type: 'STRICT_DOUBLON' | 'PARCOURS_MULTI_EXAMEN' | 'SIMILAIRE_A_VERIFIER';
  cle: string;
  items: Laureat[];
  explication: string;
}

export function detecterDoublons(laureats: Laureat[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const processedIds = new Set<string>();

  for (let i = 0; i < laureats.length; i++) {
    const a = laureats[i];
    if (processedIds.has(a.id)) continue;

    const matchedStrict: Laureat[] = [a];
    const matchedMultiExam: Laureat[] = [a];
    const matchedSimilaire: Laureat[] = [a];

    const normNomA = normaliserTexte(a.nom);
    const normPrenomsA = normaliserTexte(a.prenoms);
    const nomCompletA = normNomA + normPrenomsA;

    for (let j = i + 1; j < laureats.length; j++) {
      const b = laureats[j];
      if (processedIds.has(b.id)) continue;

      const normNomB = normaliserTexte(b.nom);
      const normPrenomsB = normaliserTexte(b.prenoms);
      const nomCompletB = normNomB + normPrenomsB;

      // 1. Doublon Strict : Même nom + prénoms + même édition + même examen
      if (
        nomCompletA === nomCompletB &&
        a.edition === b.edition &&
        a.examen === b.examen
      ) {
        matchedStrict.push(b);
      }
      // 2. Même personne à plusieurs examens (Parcours d'excellence multi-éditions)
      else if (
        nomCompletA === nomCompletB &&
        (a.edition !== b.edition || a.examen !== b.examen)
      ) {
        matchedMultiExam.push(b);
      }
      // 3. Similaire à vérifier (même nom et commune avec prénoms très proches)
      else if (
        normNomA === normNomB &&
        normaliserTexte(a.commune) === normaliserTexte(b.commune) &&
        (normPrenomsA.includes(normPrenomsB) || normPrenomsB.includes(normPrenomsA))
      ) {
        matchedSimilaire.push(b);
      }
    }

    if (matchedStrict.length > 1) {
      matchedStrict.forEach((item) => processedIds.add(item.id));
      groups.push({
        id: `dup-strict-${a.id}`,
        type: 'STRICT_DOUBLON',
        cle: `${a.nom} ${a.prenoms} (${a.edition} - ${a.examen})`,
        items: matchedStrict,
        explication: 'Ces fiches ont le même nom, la même édition et le même examen. Une fusion ou suppression est recommandée.',
      });
    } else if (matchedMultiExam.length > 1) {
      matchedMultiExam.forEach((item) => processedIds.add(item.id));
      groups.push({
        id: `dup-multi-${a.id}`,
        type: 'PARCOURS_MULTI_EXAMEN',
        cle: `${a.nom} ${a.prenoms}`,
        items: matchedMultiExam,
        explication: 'Lauréat d’excellence primé à plusieurs examens (ex: BEPC puis BAC). Leurs fiches peuvent être reliées pour valoriser le parcours.',
      });
    } else if (matchedSimilaire.length > 1) {
      matchedSimilaire.forEach((item) => processedIds.add(item.id));
      groups.push({
        id: `dup-sim-${a.id}`,
        type: 'SIMILAIRE_A_VERIFIER',
        cle: `${a.nom} (${a.commune})`,
        items: matchedSimilaire,
        explication: 'Orthographe ou commune similaire. À vérifier s’il s’agit de la même personne ou d’homonymes.',
      });
    }
  }

  return groups;
}
