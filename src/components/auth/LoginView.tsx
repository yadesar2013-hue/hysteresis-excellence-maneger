/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import firebaseConfig from '../../../firebase-applet-config.json';
import { ShieldCheck, Lock, LogOut, Clock, Ban, AlertCircle, CheckCircle2, ExternalLink, Copy, Check } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { authUser, userProfile, authError, signInWithGoogle, signOut } = useApp();
  const [signingIn, setSigningIn] = useState(false);
  const [copiedHost, setCopiedHost] = useState(false);

  const handleGoogleLogin = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } finally {
      setSigningIn(false);
    }
  };

  const isUnauthorizedDomain = authError?.startsWith('UNAUTHORIZED_DOMAIN:');
  const unauthorizedHost = isUnauthorizedDomain ? authError!.replace('UNAUTHORIZED_DOMAIN:', '') : '';

  const handleCopyHost = () => {
    if (!unauthorizedHost || typeof navigator === 'undefined') return;
    navigator.clipboard?.writeText(unauthorizedHost);
    setCopiedHost(true);
    setTimeout(() => setCopiedHost(false), 2000);
  };

  const isPending = authUser && (!userProfile || userProfile.status === 'pending' || userProfile.role === 'pending');
  const isRevoked = authUser && userProfile?.status === 'revoked';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
        {/* Bandeau institutionnel */}
        <div className="bg-[#ED5312] text-white p-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center font-black text-xl shrink-0">
              H
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-orange-100 block">
                Fondation Hystérésis · Borgou
              </span>
              <h1 className="text-lg font-bold leading-tight">
                Hystérésis Excellence Manager
              </h1>
            </div>
          </div>
          <p className="text-xs text-orange-50 mt-3 leading-relaxed">
            Plateforme sécurisée de gestion des lauréats de la « Journée de l’Excellence en milieu scolaire » et des Digit’ELLES Clubs.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {authError && isUnauthorizedDomain && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 space-y-2.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Domaine non autorisé par Firebase Auth</strong>
                  <p className="text-[11px] text-red-800 mt-0.5 leading-relaxed">
                    Ce domaine doit être ajouté dans la liste des <strong>Domaines autorisés</strong> de votre projet Firebase (<code className="font-mono">{firebaseConfig.projectId}</code>) :
                  </p>
                </div>
              </div>

              {unauthorizedHost && (
                <div className="flex items-center justify-between gap-2 bg-white border border-red-200 rounded-lg px-2.5 py-1.5">
                  <code className="text-[11px] font-mono text-slate-900 truncate">{unauthorizedHost}</code>
                  <button
                    type="button"
                    onClick={handleCopyHost}
                    className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md flex items-center gap-1 shrink-0"
                  >
                    {copiedHost ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHost ? 'Copié' : 'Copier'}</span>
                  </button>
                </div>
              )}

              <a
                href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#ED5312] hover:underline"
              >
                <span>Ouvrir les paramètres Firebase Authentication</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {authError && !isUnauthorizedDomain && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Cas 1 : Non connecté */}
          {!authUser && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#ED5312]" />
                  Connexion sécurisée requise
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  L’accès aux dossiers nominatifs et aux données de suivi est strictement réservé aux membres habilités de la Fondation Hystérésis et aux partenaires autorisés.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={signingIn}
                className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-900 font-semibold text-xs rounded-xl flex items-center justify-center gap-3 shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                  />
                </svg>
                <span>{signingIn ? 'Connexion en cours...' : 'Se connecter avec Google'}</span>
              </button>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Protection des données personnelles</span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-600 list-disc pl-4">
                  <li>Rôles vérifiés côté serveur dans la base cloud sécurisée.</li>
                  <li>Isolation stricte des coordonnées privées (téléphones, e-mails, dates de naissance).</li>
                  <li>Validation préalable par un Administrateur pour tout nouveau compte.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Cas 2 : Compte en attente de validation */}
          {isPending && !isRevoked && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Compte en attente de validation</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Votre compte Google (<strong className="font-mono">{authUser.email}</strong>) est bien authentifié, mais aucune habilitation active ne lui a encore été attribuée.
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Veuillez demander à l’administrateur de la Fondation Hystérésis de valider votre accès et de vous assigner un rôle depuis la page « Utilisateurs et rôles ».
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Identité vérifiée
                </span>
                <button
                  type="button"
                  onClick={signOut}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          )}

          {/* Cas 3 : Accès révoqué */}
          {isRevoked && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                  <Ban className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Accès suspendu ou révoqué</span>
                </div>
                <p className="text-xs text-red-800 leading-relaxed">
                  L’accès associé à l’adresse <strong className="font-mono">{authUser.email}</strong> a été désactivé par l’administrateur de la plateforme.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={signOut}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-5 text-[11px] text-slate-400 text-center">
        © Fondation Hystérésis · Journée de l’Excellence en milieu scolaire (Borgou)
      </p>
    </div>
  );
};
