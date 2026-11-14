# Spécification de Sécurité Firestore — Hystérésis Excellence Manager

## 1. Invariants de Données & Contrôle d'Accès (RBAC)

1. **Isolation stricte des données personnelles (PII)** :
   - Les données nominatives et coordonnées privées (`nom`, `prenoms`, `dateNaissance`, `telephone`, `email`, `contactsSecondaires`, `notesInternes`) résident exclusivement dans `/laureats_private/{laureatId}`.
   - Les données statistiques et académiques anonymisées résident dans `/laureats_stats/{laureatId}`.
   - Les comptes `partner` (Partenaire / Bailleur) et `club_lead` (Responsable de club) ne peuvent **jamais** lire `/laureats_private`.
2. **Zéro auto-attribution de privilège** :
   - Lors de l'inscription initiale dans `/users/{userId}`, tout utilisateur non-administrateur et sans invitation nominative dans `/role_invites/{inviteId}` est forcé au statut `pending` et rôle `pending`.
   - Aucun utilisateur ne peut modifier son propre champ `role` ou `status` lors d'une mise à jour.
3. **Administrateur amorcé (Bootstrap)** :
   - Le compte vérifié `fhysteresis@gmail.com` (`email_verified == true`) détient les droits d'administration initiaux et peut nommer d'autres administrateurs dans `/admins/{userId}` ou inviter des collaborateurs dans `/role_invites/{inviteId}`.
4. **Intégrité des identifiants, clés et horodatages** :
   - Tous les IDs de documents respectent `^[a-zA-Z0-9_\-]+$` (taille <= 128).
   - Toutes les chaînes de caractères ont une borne `.size()` explicite.
   - Tous les champs `createdAt`, `updatedAt` et `timestamp` sont vérifiés avec `request.time`.
   - Les mises à jour utilisent des branches d'actions explicites avec `affectedKeys().hasOnly(...)`.
5. **Journal d'audit immuable** :
   - Les entrées dans `/activity_logs/{logId}` peuvent être créées par les utilisateurs autorisés (`admin`, `manager`, `club_lead`) avec `userId == request.auth.uid` et ne peuvent jamais être modifiées ni supprimées.

---

## 2. Les 12 Payloads Malveillants (« Dirty Dozen ») devant retourner `PERMISSION_DENIED`

1. **Shadow Update sur `users`** : Un utilisateur tente d'ajouter un champ fantôme `isSuperAdmin: true` lors de la mise à jour de son profil -> Rejeté par `hasOnly()`.
2. **Auto-élévation de privilège à la création (`users`)** : Un nouvel utilisateur non invité tente de créer `/users/{uid}` avec `role: 'admin'` ou `status: 'active'` -> Rejeté par les règles de création.
3. **Auto-élévation à la mise à jour (`users`)** : Un `partner` ou `pending` tente de mettre à jour son propre document `/users/{uid}` en changeant `role: 'manager'` -> Rejeté par `affectedKeys().hasOnly(['displayName', 'updatedAt'])`.
4. **Usurpation d'e-mail non vérifié** : Un utilisateur se connecte avec `fhysteresis@gmail.com` mais `email_verified: false` -> Rejeté par `request.auth.token.email_verified == true`.
5. **Fuite PII via `laureats_private` (get)** : Un utilisateur `partner` ou `club_lead` appelle `getDoc(/laureats_private/laureat-2022-001)` -> Rejeté (`isManager()` requis).
6. **Fuite PII via `laureats_private` (list)** : Un utilisateur `partner` ou `pending` exécute `getDocs(collection(db, 'laureats_private'))` -> Rejeté (`isManager()` requis).
7. **Lecture non autorisée par compte `pending`** : Un utilisateur inconnu connecté (statut `pending`) tente de lister `laureats_stats` ou `clubs` -> Rejeté (`isActiveUser()` requis).
8. **Injection d'ID toxique (ID Poisoning)** : Tentative de création d'un document avec un ID de 500 caractères ou contenant des espaces/caractères spéciaux -> Rejeté par `isValidId()`.
9. **Falsification d'horodatage (`createdAt`)** : Un client envoie une date falsifiée dans le passé au lieu de `serverTimestamp()` -> Rejeté par `incoming().createdAt == request.time`.
10. **Usurpation d'auteur (`createdBy` / `userId`)** : Un utilisateur tente de créer un `activity_logs` avec le `userId` d'un autre collaborateur -> Rejeté par `incoming().userId == request.auth.uid`.
11. **Altération du journal d'audit** : Tentative de `update` ou `delete` sur `/activity_logs/{logId}` même par un gestionnaire -> Rejeté (`allow update, delete: if false;`).
12. **Écriture de champ surdimensionné (Denial of Wallet)** : Tentative d'envoi d'une chaîne de 1 Mo dans `notesInternes` ou `nom` -> Rejeté par `.size() <= MAX`.
