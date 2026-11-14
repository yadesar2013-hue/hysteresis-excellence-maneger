/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, UserStatus } from '../../types/laureat';
import { COMMUNES_BORGOU } from '../../data/referentielsBorgou';
import {
  Shield,
  UserPlus,
  CheckCircle2,
  Trash2,
  Clock,
  Lock,
  Mail,
  AlertTriangle,
  Users,
} from 'lucide-react';

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  manager: 'Gestionnaire de programme',
  club_lead: 'Responsable de club',
  partner: 'Partenaire / Bailleur',
  pending: 'En attente',
};

const ROLE_DESCRIPTIONS: Record<Exclude<UserRole, 'pending'>, string> = {
  admin: 'Accès complet : PII, imports/exports, suppressions définitives, audit et gestion des rôles.',
  manager: 'Accès complet aux fiches nominatives, importations, suivi et Digit’ELLES Clubs.',
  club_lead: 'Accès aux statistiques et gestion des membres Digit’ELLES Club (sans données personnelles privées).',
  partner: 'Consultation des statistiques agrégées uniquement (identité et coordonnées protégées côté base).',
};

export const UsersRolesView: React.FC = () => {
  const {
    authUser,
    allUsers,
    roleInvites,
    inviteUserByEmail,
    deleteInvite,
    updateUserRoleAndStatus,
  } = useApp();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Exclude<UserRole, 'pending'>>('manager');
  const [inviteCommune, setInviteCommune] = useState<string>(COMMUNES_BORGOU[0]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const pendingUsers = allUsers.filter((u) => u.status === 'pending' || u.role === 'pending');
  const sortedUsers = [...allUsers].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (b.status === 'pending' && a.status !== 'pending') return 1;
    return (a.email || '').localeCompare(b.email || '');
  });

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = inviteEmail.trim().toLowerCase();
    if (!cleaned || !cleaned.includes('@')) {
      setFeedback({ type: 'err', msg: 'Veuillez saisir une adresse e-mail Google valide.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      await inviteUserByEmail(
        cleaned,
        inviteRole,
        inviteRole === 'club_lead' ? inviteCommune : undefined
      );
      setInviteEmail('');
      setFeedback({
        type: 'ok',
        msg: `Invitation enregistrée pour ${cleaned} (${ROLE_LABELS[inviteRole]}). Lors de sa première connexion Google, ce rôle sera appliqué automatiquement.`,
      });
    } catch {
      setFeedback({ type: 'err', msg: "Impossible d'enregistrer l'invitation." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (
    uid: string,
    role: UserRole,
    status: UserStatus,
    clubCommune?: string
  ) => {
    setFeedback(null);
    try {
      await updateUserRoleAndStatus(uid, role, status, clubCommune);
      setFeedback({ type: 'ok', msg: 'Habilitation utilisateur mise à jour côté serveur.' });
    } catch {
      setFeedback({ type: 'err', msg: 'Erreur lors de la mise à jour de l’utilisateur.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#ED5312] uppercase tracking-wider">
            Gouvernance & Contrôle d’Accès (RBAC)
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mt-0.5">
          Utilisateurs, Invitations & Rôles d’Accès
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Validez les nouveaux comptes Google et attribuez des habilitations strictement appliquées par les règles de sécurité Firestore.
        </p>

        {feedback && (
          <div
            className={`mt-4 p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
              feedback.type === 'ok'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            {feedback.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.msg}</span>
          </div>
        )}
      </div>

      {/* Formulaire de pré-invitation par e-mail */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <UserPlus className="w-4 h-4 text-[#ED5312]" />
          <h3 className="text-sm font-bold text-slate-900">
            Pré-autoriser un collaborateur ou partenaire par e-mail Google
          </h3>
        </div>

        <form onSubmit={handleInviteSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end text-xs">
          <div className="md:col-span-2">
            <label className="block text-slate-700 font-semibold mb-1">
              Adresse e-mail Google du bénéficiaire
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="ex: collaborateur@gmail.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Rôle attribué</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as Exclude<UserRole, 'pending'>)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#ED5312]"
            >
              <option value="manager">Gestionnaire de programme</option>
              <option value="club_lead">Responsable de club</option>
              <option value="partner">Partenaire / Bailleur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          {inviteRole === 'club_lead' ? (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Commune du Club</label>
              <div className="flex gap-2">
                <select
                  value={inviteCommune}
                  onChange={(e) => setInviteCommune(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                >
                  {COMMUNES_BORGOU.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#ED5312] hover:bg-[#D64307] text-white font-bold rounded-lg transition-colors shrink-0 disabled:opacity-50"
                >
                  Inviter
                </button>
              </div>
            </div>
          ) : (
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 px-4 bg-[#ED5312] hover:bg-[#D64307] text-white font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? 'Enregistrement...' : 'Enregistrer l’invitation'}
              </button>
            </div>
          )}
        </form>

        <p className="text-[11px] text-slate-500">
          {ROLE_DESCRIPTIONS[inviteRole]}
        </p>
      </div>

      {/* Comptes en attente d'approbation */}
      {pendingUsers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-900">
            <Clock className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold">
              {pendingUsers.length} demande(s) d’accès en attente de validation
            </h3>
          </div>
          <div className="space-y-2">
            {pendingUsers.map((u) => (
              <div
                key={u.uid}
                className="bg-white border border-amber-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <strong className="text-slate-900">{u.displayName}</strong>
                  <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleUpdateUser(u.uid, 'manager', 'active')}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold"
                  >
                    Valider Gestionnaire
                  </button>
                  <button
                    onClick={() => handleUpdateUser(u.uid, 'club_lead', 'active', COMMUNES_BORGOU[0])}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-semibold"
                  >
                    Valider Resp. Club
                  </button>
                  <button
                    onClick={() => handleUpdateUser(u.uid, 'partner', 'active')}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold"
                  >
                    Valider Partenaire
                  </button>
                  <button
                    onClick={() => handleUpdateUser(u.uid, 'pending', 'revoked')}
                    className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md font-semibold"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des utilisateurs enregistrés */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#ED5312]" />
            Comptes Utilisateurs Enregistrés ({allUsers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Utilisateur</th>
                <th className="py-2.5 px-3">E-mail</th>
                <th className="py-2.5 px-3">Rôle</th>
                <th className="py-2.5 px-3">Commune (Club)</th>
                <th className="py-2.5 px-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedUsers.map((u) => {
                const isSelf = authUser?.uid === u.uid;
                const isBootstrapAdmin = u.email?.toLowerCase() === 'fhysteresis@gmail.com';
                return (
                  <tr key={u.uid} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {u.displayName}
                      {isSelf && (
                        <span className="ml-1.5 text-[10px] text-[#ED5312] font-bold">(Vous)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{u.email}</td>
                    <td className="py-2.5 px-3">
                      <select
                        aria-label={`Rôle pour ${u.email}`}
                        disabled={isBootstrapAdmin}
                        value={u.role}
                        onChange={(e) =>
                          handleUpdateUser(
                            u.uid,
                            e.target.value as UserRole,
                            e.target.value === 'pending' ? 'pending' : u.status === 'pending' ? 'active' : u.status,
                            u.clubCommune || (e.target.value === 'club_lead' ? COMMUNES_BORGOU[0] : undefined)
                          )
                        }
                        className="p-1.5 bg-white border border-slate-200 rounded-md font-medium text-slate-800 disabled:opacity-60"
                      >
                        <option value="admin">Administrateur</option>
                        <option value="manager">Gestionnaire</option>
                        <option value="club_lead">Resp. Club</option>
                        <option value="partner">Partenaire</option>
                        <option value="pending">En attente</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3">
                      {u.role === 'club_lead' ? (
                        <select
                          aria-label={`Commune pour ${u.email}`}
                          value={u.clubCommune || COMMUNES_BORGOU[0]}
                          onChange={(e) =>
                            handleUpdateUser(u.uid, u.role, u.status, e.target.value)
                          }
                          className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-800"
                        >
                          {COMMUNES_BORGOU.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        aria-label={`Statut pour ${u.email}`}
                        disabled={isBootstrapAdmin}
                        value={u.status}
                        onChange={(e) =>
                          handleUpdateUser(u.uid, u.role, e.target.value as UserStatus, u.clubCommune)
                        }
                        className={`p-1.5 border rounded-md font-semibold disabled:opacity-60 ${
                          u.status === 'active'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : u.status === 'pending'
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                      >
                        <option value="active">Actif</option>
                        <option value="pending">En attente</option>
                        <option value="revoked">Révoqué</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invitations en attente de première connexion */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#ED5312]" />
            Invitations Pré-autorisées ({roleInvites.length})
          </h3>
        </div>

        {roleInvites.length === 0 ? (
          <p className="text-xs text-slate-500 italic">
            Aucune pré-invitation enregistrée pour le moment.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {roleInvites.map((inv) => (
              <div key={inv.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="font-mono text-slate-900">{inv.email}</strong>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                    {ROLE_LABELS[inv.role]}
                  </span>
                  {inv.clubCommune && (
                    <span className="text-slate-500 text-[11px]">· Club {inv.clubCommune}</span>
                  )}
                </div>
                <button
                  onClick={() => deleteInvite(inv.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Supprimer l'invitation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Matrice de protection PII */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>Architecture d’Isolation des Données Personnelles (Serveur Firestore)</span>
        </div>
        <p className="text-slate-600 leading-relaxed">
          Les données nominatives et coordonnées de contact (<code className="font-mono text-slate-800">laureats_private</code>) sont physiquement séparées des indicateurs statistiques et scolaires (<code className="font-mono text-slate-800">laureats_stats</code>). Seuls les comptes <strong>Administrateur</strong> et <strong>Gestionnaire</strong> actifs reçoivent l’autorisation serveur de lire ou modifier les données personnelles.
        </p>
      </div>
    </div>
  );
};
