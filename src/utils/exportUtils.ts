/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { Laureat } from '../types/laureat';

export function exporterEnExcel(laureats: Laureat[], nomFichier = 'Laureats_Fondation_Hysteresis.xlsx', anonymiser = false) {
  const donneesFormatees = laureats.map((l) => ({
    'N°': l.numeroOrigine || '',
    'Nom': anonymiser ? `${l.nom.charAt(0)}***` : l.nom,
    'Prénoms': anonymiser ? `${l.prenoms.charAt(0)}***` : l.prenoms,
    'Sexe': l.sexe,
    'Édition': l.edition,
    'Examen': l.examen,
    'Commune': l.commune,
    'Département': l.departement,
    'Établissement': l.etablissement,
    'Type Établissement': l.typeEtablissement,
    'Moyenne': l.moyenne,
    'Rang': l.rang,
    'Série': l.serie || '',
    'Mention': l.mention || '',
    'Date de Naissance': anonymiser ? 'Confidentiel' : (l.dateNaissance || ''),
    'Lieu de Naissance': l.lieuNaissance || '',
    'Téléphone': anonymiser ? 'Masqué (Bailleur)' : (l.telephone || ''),
    'Libellé Contact': anonymiser ? '' : (l.telephoneLibelle || ''),
    'Ordinateur Reçu': l.ordinateurRecu ? 'Oui' : 'Non',
    'Tablette Reçue': l.tabletteRecue ? 'Oui' : 'Non',
    'Bourse Reçue': l.bourseRecue ? 'Oui' : 'Non',
    'Statut Actuel': l.statutActuel,
    'Orientation STEM': l.orientationStem,
    'Digit’ELLES Club': l.participationClub ? `Oui (${l.clubCommune || ''})` : 'Non',
    'Rôle Club': l.roleClub || '',
    'Statut Suivi': l.statutRelance,
    'Taux Complétude': `${l.tauxCompletude}%`,
    'Observations': l.remarquesScolaires || '',
  }));

  const feuille = XLSX.utils.json_to_sheet(donneesFormatees);
  const classeur = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(classeur, feuille, 'Lauréats');

  // Ajuster la largeur des colonnes
  const colWidths = [
    { wch: 6 }, // N°
    { wch: 18 }, // Nom
    { wch: 22 }, // Prénoms
    { wch: 6 }, // Sexe
    { wch: 8 }, // Édition
    { wch: 8 }, // Examen
    { wch: 14 }, // Commune
    { wch: 14 }, // Département
    { wch: 32 }, // Établissement
    { wch: 14 }, // Type Établissement
    { wch: 10 }, // Moyenne
    { wch: 12 }, // Rang
    { wch: 12 }, // Série
    { wch: 14 }, // Mention
    { wch: 14 }, // Naissance
    { wch: 16 }, // Lieu
    { wch: 18 }, // Téléphone
    { wch: 14 }, // Libellé
    { wch: 12 }, // PC
    { wch: 12 }, // Tablette
    { wch: 12 }, // Bourse
    { wch: 14 }, // Statut
    { wch: 14 }, // STEM
    { wch: 16 }, // Club
    { wch: 14 }, // Rôle
    { wch: 12 }, // Relance
    { wch: 12 }, // Complétude
    { wch: 30 }, // Observations
  ];
  feuille['!cols'] = colWidths;

  XLSX.writeFile(classeur, nomFichier);
}

export function exporterEnCSV(laureats: Laureat[], nomFichier = 'Laureats_Fondation_Hysteresis.csv', anonymiser = false) {
  const donneesFormatees = laureats.map((l) => ({
    'N°': l.numeroOrigine || '',
    'Nom': anonymiser ? `${l.nom.charAt(0)}***` : l.nom,
    'Prénoms': anonymiser ? `${l.prenoms.charAt(0)}***` : l.prenoms,
    'Sexe': l.sexe,
    'Édition': l.edition,
    'Examen': l.examen,
    'Commune': l.commune,
    'Établissement': l.etablissement,
    'Moyenne': l.moyenne,
    'Rang': l.rang,
    'Série': l.serie || '',
    'Mention': l.mention || '',
    'Téléphone': anonymiser ? 'Masqué' : (l.telephone || ''),
    'Ordinateur Reçu': l.ordinateurRecu ? 'Oui' : 'Non',
    'Statut Actuel': l.statutActuel,
    'Orientation STEM': l.orientationStem,
    'Digit’ELLES Club': l.participationClub ? 'Oui' : 'Non',
  }));

  const feuille = XLSX.utils.json_to_sheet(donneesFormatees);
  const csvContent = XLSX.utils.sheet_to_csv(feuille, { FS: ';' });

  // Ajouter UTF-8 BOM pour ouverture propre dans Microsoft Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.setAttribute('href', url);
  lien.setAttribute('download', nomFichier);
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  URL.revokeObjectURL(url);
}
