import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    ShieldCheckIcon,
    CheckCircleIcon,
    XCircleIcon,
    UserCircleIcon,
    CameraIcon,
    DocumentTextIcon,
    UsersIcon,
    CalendarIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ArrowDownTrayIcon,
    LockClosedIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { API_ROUTES } from '../config/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-start py-3 border-b border-slate-100 last:border-0">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-bold text-slate-700 text-right max-w-xs">{value}</span>
    </div>
)

const StatusBadge = ({ status }) => {
    const map = {
        pending: { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
        validated: { label: 'Validé', cls: 'bg-primary-100 text-primary-700' },
        invalidated: { label: 'Invalidé', cls: 'bg-red-100 text-red-700' },
        validate: { label: 'Validé (Brouillon)', cls: 'bg-primary-50 text-primary-600 border border-primary-100' },
        invalidate: { label: 'Invalidé (Brouillon)', cls: 'bg-red-50 text-red-600 border border-red-100' },
    }
    const { label, cls } = map[status] || map.pending
    return <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${cls}`}>{label}</span>
}

// ─── ModeratorPortalPage ──────────────────────────────────────────────────────
const ModeratorPortalPage = () => {
    const { id, sessionId } = useParams()
    const { user, loginWithToken, loginWithGoogle, loginWithOffice365 } = useAuth()
    const [scrutin, setScrutin] = useState(null)
    const [loading, setLoading] = useState(true)

    // Per-session decision state: { [sessionId]: { status, reason } }
    const [decisions, setDecisions] = useState({})
    const [expandedSessions, setExpandedSessions] = useState({})
    const [showReasonFor, setShowReasonFor] = useState(null)
    const [reasonDraft, setReasonDraft] = useState('')
    const [isSocialVerified, setIsSocialVerified] = useState(false)
    const [isSubmittingAll, setIsSubmittingAll] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    React.useEffect(() => {
        const init = async () => {
            try {
                setLoading(true)

                // 1. Handle Magic Link authentication if token is present
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token');
                if (token && (!user || user.role !== 'moderator')) {
                    try {
                        await loginWithToken(token);
                    } catch (err) {
                        toast.error("Lien d'invitation invalide ou expiré");
                    }
                }

                // 2. Fetch Scrutin data
                const res = await fetch(`${API_ROUTES.SCRUTINS}`)
                const result = await res.json()
                if (result.success) {
                    const found = result.data.find(s => s.address?.toLowerCase() === id?.toLowerCase())
                    if (found) {
                        setScrutin(found)
                        const initialDecisions = {}
                        const initialExpanded = {}
                        found.sessions.forEach(s => {
                            initialDecisions[s.address] = { status: 'pending', reason: '' }
                            initialExpanded[s.address] = true
                        })
                        setDecisions(initialDecisions)
                        setExpandedSessions(initialExpanded)
                    } else {
                        toast.error("Scrutin introuvable")
                    }
                }
            } catch (err) {
                toast.error("Erreur de chargement")
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [id, loginWithToken, user])

    const sessionsToShow = scrutin
        ? (sessionId ? scrutin.sessions.filter(s => s.address === sessionId) : scrutin.sessions)
        : []

    const toggleExpand = (sid) => setExpandedSessions(prev => ({ ...prev, [sid]: !prev[sid] }))

    // --- SUBMISSION LOGIC & PERMISSIONS ---
    const getSessionModeratorStatus = (session) => {
        return session.moderators?.some(m => {
            const modEmail = typeof m === 'string' ? m : m?.email;
            return modEmail?.toLowerCase() === user?.email?.toLowerCase();
        }) || user?.role === 'superadmin';
    }

    const allDecided = scrutin && scrutin.sessions.every(s => {
        if (!getSessionModeratorStatus(s)) return true; // Only require for assigned sessions
        return decisions[s.address]?.status !== 'pending';
    })

    const allValidated = scrutin && scrutin.sessions.every(s => {
        if (!getSessionModeratorStatus(s)) return true;
        const d = decisions[s.address]
        return d?.status === 'validate' || d?.status === 'validated';
    })

    const authorizedSessionsCount = scrutin ? scrutin.sessions.filter(getSessionModeratorStatus).length : 0;
    const decisionsReachedCount = scrutin ? scrutin.sessions.filter(s => getSessionModeratorStatus(s) && decisions[s.address]?.status !== 'pending').length : 0;

    const getFinalDecisions = () => {
        const final = {};
        if (!scrutin) return final;
        scrutin.sessions.forEach(s => {
            if (getSessionModeratorStatus(s) && decisions[s.address]?.status !== 'pending') {
                final[s.address] = decisions[s.address];
            }
        });
        return final;
    };

    const handleVoteDecision = (sid, decision, reason = '') => {
        setDecisions(prev => ({ ...prev, [sid]: { status: decision, reason } }))
        toast.success(decision === 'validate' ? 'Décision (Brouillon) : Validé' : 'Décision (Brouillon) : Invalidé')
    }

    const submitAllDecisions = async () => {
        const finalDecisions = getFinalDecisions();
        if (Object.keys(finalDecisions).length === 0) {
            toast.error("Aucune décision à soumettre.");
            return;
        }

        if (!isSocialVerified && user?.role !== 'superadmin') {
            toast.error("Veuillez d'abord vérifier votre identité via Google ou Microsoft.");
            return;
        }

        setIsSubmittingAll(true);
        const toastId = toast.loading("Enregistrement des décisions sur la Blockchain...");

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');

            // Format decisions for batch processing
            const batchDecisions = Object.entries(finalDecisions).map(([sid, dec]) => ({
                sessionId: sid,
                decision: dec.status,
                reason: dec.reason
            }));

            const res = await fetch(`${API_ROUTES.MODERATORS}/batch-decision`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    decisions: batchDecisions,
                    token: token
                })
            });

            const result = await res.json();
            if (!result.success) {
                throw new Error(result.error || "Une erreur est survenue lors du scellage.");
            }

            // Check if any specific session failed in the batch
            const failures = (result.results || []).filter(r => !r.success);
            if (failures.length > 0) {
                console.warn("Certaines sessions n'ont pas pu être traitées:", failures);
                toast.error(`${failures.length} session(s) en échec.`);
            }

            toast.success("Toutes les décisions ont été scellées !", { id: toastId })
            setIsSubmitted(true)
        } catch (err) {
            toast.error(err.message, { id: toastId })
        } finally {
            setIsSubmittingAll(false)
        }
    }

    const downloadVotersList = (voters, sessionTitle) => {
        if (!voters || voters.length === 0) return;
        const blob = new Blob([voters.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voters_${sessionTitle.replace(/\s+/g, '_').toLowerCase()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Liste des électeurs téléchargée (.txt)");
    };

    const handleSocialLogin = async (provider) => {
        const width = 600, height = 700
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2
        let url = '';

        try {
            toast.loading("Initialisation sécurisée...", { id: 'oauth-init' });
            const configRes = await fetch(`${API_ROUTES.AUTH}/oauth-config`);
            const config = await configRes.json();
            toast.dismiss('oauth-init');

            if (provider === 'google' && config.googleClientId) {
                url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.googleClientId}&redirect_uri=${encodeURIComponent(window.location.origin + '/oauth-callback')}&response_type=token&scope=email%20profile`;
            } else if (provider === 'microsoft' && config.microsoftClientId) {
                url = `https://login.microsoftonline.com/${config.microsoftTenantId || 'common'}/oauth2/v2.0/authorize?client_id=${config.microsoftClientId}&response_type=token&redirect_uri=${encodeURIComponent(window.location.origin + '/oauth-callback')}&scope=User.Read%20email%20openid%20profile`;
            } else {
                const popupContent = `
                    <html>
                        <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f8fafc; margin: 0; padding: 20px; text-align: center;">
                            <img src="https://www.${provider}.com/favicon.ico" style="width: 48px; margin-bottom: 20px;">
                            <h2 style="color: #0f172a; margin-bottom: 8px;">Vérification Identity</h2>
                            <p style="color: #64748b; font-size: 14px; margin-bottom: 30px;">Choisissez un compte pour continuer vers <b>VoteChain</b></p>
                            <div onclick="window.close()" style="cursor: pointer; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px 25px; display: flex; align-items: center; gap: 15px; width: 100%; max-width: 300px; transition: background 0.2s;">
                                <div style="width: 32px; height: 32px; background: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">${user?.email?.charAt(0).toUpperCase()}</div>
                                <div style="text-align: left;">
                                    <div style="font-weight: bold; font-size: 14px; color: #1e293b;">${user?.email}</div>
                                    <div style="font-size: 12px; color: #94a3b8;">Connecté</div>
                                </div>
                            </div>
                            <p style="margin-top: 30px; font-size: 11px; color: #94a3b8;">Ceci est un environnement de démonstration sécurisé.</p>
                        </body>
                        <script>
                            window.onunload = () => window.opener.postMessage('verified', '*');
                        </script>
                    </html>
                `;
                const blob = new Blob([popupContent], { type: 'text/html' });
                url = URL.createObjectURL(blob);
            }

            const win = window.open(url, 'OAuth2 Verification', `width=${width},height=${height},left=${left},top=${top}`);

            const handleMsg = async (event) => {
                if (event.data?.type === 'oauth-success') {
                    window.removeEventListener('message', handleMsg);
                    toast.loading(`Vérification auprès de ${provider === 'google' ? 'Google' : 'Microsoft'}...`, { id: 'oauth-verify' });

                    try {
                        let email = null;
                        if (provider === 'google') {
                            const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                                headers: { Authorization: `Bearer ${event.data.token}` }
                            });
                            const googleData = await googleRes.json();
                            email = googleData.email;
                        } else if (provider === 'microsoft') {
                            const msRes = await fetch('https://graph.microsoft.com/v1.0/me', {
                                headers: { Authorization: `Bearer ${event.data.token}` }
                            });
                            const msData = await msRes.json();
                            email = msData.mail || msData.userPrincipalName;
                        }

                        if (email && email.toLowerCase() === user?.email?.toLowerCase()) {
                            setIsSocialVerified(true);
                            toast.success(`Identité certifiée ${provider === 'google' ? 'Google' : 'Microsoft'} ✓`, { id: 'oauth-verify' });
                        } else {
                            toast.error(`Échec: Email saisi (${email || 'Inconnu'}) différent du compte autorisé (${user?.email})`, { id: 'oauth-verify', duration: 6000 });
                        }
                    } catch (err) {
                        toast.error(`Erreur avec ${provider === 'google' ? 'Google' : 'Microsoft'} API.`, { id: 'oauth-verify' });
                    }
                } else if (event.data === 'verified') {
                    window.removeEventListener('message', handleMsg);
                    setIsSocialVerified(true);
                    toast.success('Identité confirmée ✓');
                }
            };
            window.addEventListener('message', handleMsg);
        } catch (err) {
            toast.error("Impossible d'initialiser OAuth.");
            toast.dismiss('oauth-init');
        }
    }

    const handleValidate = (sid) => {
        if (!isSocialVerified && user?.role !== 'superadmin') {
            toast.error("Veuillez d'abord vérifier votre identité via Google ou Microsoft.");
            return;
        }
        handleVoteDecision(sid, 'validate');
    }

    const openInvalidateDialog = (sid, isAuthorized) => {
        if (!isAuthorized) {
            toast.error("Vous n'êtes pas modérateur assigné pour cette session.");
            return;
        }
        if (!isSocialVerified && user?.role !== 'superadmin') {
            toast.error("Veuillez d'abord vérifier votre identité via Google ou Microsoft.");
            return;
        }
        setShowReasonFor(sid);
        setReasonDraft('');
    }

    const confirmInvalidate = () => {
        if (!reasonDraft.trim()) { toast.error('Veuillez saisir une justification.'); return }
        handleVoteDecision(showReasonFor, 'invalidate', reasonDraft.trim())
        setShowReasonFor(null)
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
                <p className="text-slate-400 font-bold animate-pulse text-sm text-center">Vérification de l'invitation...</p>
            </div>
        </div>
    )

    if (!scrutin) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <p className="font-black text-slate-400">Scrutin introuvable ou erreur de chargement.</p>
        </div>
    )

    const userEmail = user?.email?.toLowerCase()
    const isAuthorized = sessionsToShow.some(s =>
        (s.moderators || []).some(m => {
            const modEmail = typeof m === 'string' ? m : m?.email
            return modEmail?.toLowerCase() === userEmail
        })
    )

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 px-6 text-left">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-12 text-center shadow-2xl">
                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-900/40">
                        <LockClosedIcon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-4 tracking-tight">Authentification Requise</h2>
                    <p className="text-slate-400 font-medium mb-8 text-sm leading-relaxed">
                        Vous devez vous authentifier pour accéder à ce portail de modération.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => loginWithGoogle(id)}
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-slate-100 transition-all shadow-lg"
                        >
                            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                            Continuer avec Google
                        </button>
                        <button
                            onClick={() => loginWithOffice365(id)}
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-[#00A4EF]/10 border border-[#00A4EF]/20 text-[#00A4EF] rounded-2xl font-black hover:bg-[#00A4EF]/20 transition-all"
                        >
                            <img src="https://www.microsoft.com/favicon.ico" className="w-5 h-5" alt="Microsoft" />
                            Continuer avec Office 365
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!isAuthorized && user?.role !== 'superadmin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 px-6 text-left">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-12 text-center">
                    <XCircleIcon className="h-20 w-20 text-red-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-white mb-4">Accès Refusé</h2>
                    <p className="text-slate-400 font-medium mb-8">
                        Votre adresse ({user?.email || 'non identifiée'}) n'est pas autorisée comme modérateur pour ce scrutin.
                        Si vous avez reçu un mail, assurez-vous d'utiliser le compte lié à cette adresse.
                    </p>
                    <button onClick={() => window.location.href = '/login'} className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black transition-all">
                        Se connecter avec un autre compte
                    </button>
                </div>
            </div>
        )
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
            {showReasonFor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <XCircleIcon className="w-8 h-8 text-red-500 shrink-0" />
                            <div>
                                <h3 className="font-black text-slate-900 text-lg">Invalider la session</h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    {scrutin.sessions.find(s => s.address === showReasonFor)?.title}
                                </p>
                            </div>
                        </div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                            Justification *
                        </label>
                        <textarea
                            rows="4"
                            value={reasonDraft}
                            onChange={e => setReasonDraft(e.target.value)}
                            autoFocus
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-red-400 focus:border-red-300 text-slate-800 placeholder-slate-400 mb-6"
                            placeholder="Expliquez pourquoi vous invalidez cette session..."
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowReasonFor(null)}
                                className="flex-1 py-3 border-2 border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                                Annuler
                            </button>
                            <button onClick={confirmInvalidate}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black shadow-lg shadow-red-500/20 transition-all">
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-xl mx-auto px-4 sm:px-0 pt-10 pb-40">
                <div className="flex items-center gap-3 mb-6 text-left">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-900/30 shrink-0">
                        <ShieldCheckIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Portail Modérateur · VoteChain</p>
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">Validation du Scrutin</h1>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur rounded-3xl border border-white/10 p-6 mb-6 flex items-start gap-6 text-left">
                    {scrutin?.logoUrl && (
                        <div className="h-24 w-24 bg-white rounded-2xl border-2 border-white/10 shadow-lg flex-shrink-0 flex items-center justify-center p-2">
                            <img src={scrutin.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                        </div>
                    )}
                    <div className="flex-1 text-left">
                        <h2 className="text-xs font-black text-white/50 uppercase tracking-widest mb-4">Informations du Scrutin</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                            <div>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Titre</p>
                                <p className="font-black text-white text-lg tracking-tight">{scrutin.title}</p>
                            </div>
                            {scrutin.description && (
                                <div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Description</p>
                                    <p className="text-white/70 text-sm font-medium leading-relaxed">{scrutin.description}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Portée</p>
                                <p className="text-white/80 font-bold text-sm capitalize">{scrutin.scope} {scrutin.country ? `· ${scrutin.country}` : ''}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Pilotage</p>
                                <p className="text-white/80 font-bold text-sm">
                                    {scrutin.timingMode === 'scheduled'
                                        ? `Du ${new Date(scrutin.startDate).toLocaleDateString('fr-FR')} au ${new Date(scrutin.endDate).toLocaleDateString('fr-FR')}`
                                        : 'Manuel'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-400/20 rounded-2xl px-5 py-4 mb-8 flex items-start gap-3 text-left">
                    <ShieldCheckIcon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-amber-200 text-sm font-medium leading-relaxed">
                        En tant que modérateur, votre validation est requise pour chaque session. Un seul refus suffit à bloquer l'ouverture de la session concernée.
                    </p>
                </div>

                {!isSocialVerified && user?.role !== 'superadmin' && (
                    <div className="bg-primary-600/20 border-2 border-primary-500/30 rounded-[32px] p-8 mb-8 text-center backdrop-blur-sm shadow-xl shadow-primary-900/10">
                        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <UserCircleIcon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Vérification d'Identité Requise</h3>
                        <p className="text-slate-400 text-sm font-medium mb-6 max-w-sm mx-auto">
                            Pour sécuriser ce scrutin, vous devez confirmer que vous êtes bien le propriétaire de l'adresse <strong>{user?.email}</strong> via un fournisseur d'identité.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => handleSocialLogin('google')}
                                className="flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-slate-900 rounded-2xl font-black hover:bg-slate-100 transition-all shadow-lg"
                            >
                                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                                Vérifier avec Google
                            </button>
                            <button
                                onClick={() => handleSocialLogin('microsoft')}
                                className="flex items-center justify-center gap-3 px-6 py-3.5 bg-[#00A4EF]/10 border border-[#00A4EF]/20 text-[#00A4EF] rounded-2xl font-black hover:bg-[#00A4EF]/20 transition-all"
                            >
                                <img src="https://www.microsoft.com/favicon.ico" className="w-4 h-4" alt="Microsoft" />
                                Vérifier avec Office 365
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {sessionsToShow.map((session, si) => {
                        const decision = decisions[session.address] || { status: 'pending' }
                        const expanded = expandedSessions[session.address]

                        // Check if current user is assigned as a moderator for THIS specific session
                        const userIsModerator = session.moderators?.some(m => {
                            const modEmail = typeof m === 'string' ? m : m?.email;
                            return modEmail?.toLowerCase() === user?.email?.toLowerCase();
                        }) || user?.role === 'superadmin';

                        const isLocked = (!isSocialVerified && user?.role !== 'superadmin') || !userIsModerator;

                        return (
                            <div key={session.address} className={`bg-white rounded-3xl shadow-xl overflow-hidden border-2
                ${decision.status === 'validate' ? 'border-primary-200'
                                    : decision.status === 'invalidate' ? 'border-red-200'
                                        : 'border-transparent'}`}>

                                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/60 cursor-pointer"
                                    onClick={() => toggleExpand(session.address)}>
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 text-sm font-black flex items-center justify-center">{si + 1}</span>
                                        <div className="text-left">
                                            <p className="font-black text-slate-900 text-base leading-tight">{session.title}</p>
                                            <div className="mt-1 flex gap-2">
                                                <StatusBadge status={decision.status} />
                                                {!userIsModerator && (
                                                    <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">Non assigné</span>
                                                )}
                                                {decision.status !== 'pending' && !isSubmitted && (
                                                    <span className="text-[8px] font-black uppercase text-secondary-500 bg-secondary-50 px-2 py-0.5 rounded-md border border-secondary-100">Brouillon</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors">
                                        {expanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                                    </button>
                                </div>

                                {expanded && (
                                    <div className="p-6 space-y-6 text-left">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <DocumentTextIcon className="w-3.5 h-3.5" /> Informations de la session
                                            </p>
                                            <div className="bg-slate-50 rounded-2xl border border-slate-100 px-4 divide-y divide-slate-100">
                                                <InfoRow label="Titre" value={session.title} />
                                                {session.description && <InfoRow label="Description" value={session.description} />}
                                                <InfoRow label="Capacité" value={`${session.voterCount || 0} électeurs`} />
                                                <InfoRow label="Options" value={`${session.options ? session.options.length : 0} candidats`} />
                                            </div>
                                        </div>

                                        {((session.voters && session.voters.length > 0) || (scrutin.voters && scrutin.voters.length > 0)) ? (
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                        <UserCircleIcon className="w-3.5 h-3.5" /> Liste des Électeurs ({session.voters && session.voters.length > 0 ? session.voters.length : scrutin.voters?.length || 0} inscrits)
                                                    </p>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); downloadVotersList(session.voters && session.voters.length > 0 ? session.voters : (scrutin.voters || []), session.title); }}
                                                        className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-primary-50 transition-colors"
                                                    >
                                                        <ArrowDownTrayIcon className="w-3 h-3" /> Exporter (.txt)
                                                    </button>
                                                </div>
                                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 max-h-40 overflow-y-auto">
                                                    <div className="flex flex-wrap gap-2">
                                                        {(session.voters && session.voters.length > 0 ? session.voters : (scrutin.voters || [])).map((v, vi) => (
                                                            <span key={vi} className="text-[10px] font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-slate-600 shadow-sm">
                                                                {v}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
                                                <UserCircleIcon className="w-5 h-5 text-amber-500" />
                                                <p className="text-xs font-bold text-amber-700">Aucun électeur configuré pour cette session.</p>
                                            </div>
                                        )}

                                        {session.moderators && session.moderators.length > 0 && (
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <ShieldCheckIcon className="w-3.5 h-3.5" /> Collège des Modérateurs ({session.moderators.length})
                                                </p>
                                                <div className="bg-primary-50/30 border border-primary-100/50 rounded-2xl p-4 text-left">
                                                    <div className="flex flex-wrap gap-2">
                                                        {session.moderators.map((m, mi) => {
                                                            const modEmail = typeof m === 'string' ? m : m?.email
                                                            const isCurrentUser = modEmail?.toLowerCase() === user?.email?.toLowerCase()
                                                            return (
                                                                <div key={mi} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-tight 
                                                                ${isCurrentUser
                                                                        ? 'bg-primary-600 border-primary-700 text-white shadow-lg shadow-primary-500/20'
                                                                        : 'bg-white border-slate-200 text-slate-500'}`}>
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${isCurrentUser ? 'bg-white' : 'bg-primary-400'}`} />
                                                                    {modEmail}
                                                                    {isCurrentUser && <span className="text-[8px] bg-white/20 px-1 rounded ml-1">VOUS</span>}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <UsersIcon className="w-3.5 h-3.5" /> Options / Listes candidates
                                            </p>
                                            <div className="space-y-4 text-left">
                                                {(session.options || []).map((part, pi) => (
                                                    <div key={pi} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left">
                                                        <div className="flex items-center gap-3 mb-3 text-left">
                                                            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                                                                {part.imageUrl
                                                                    ? <img src={part.imageUrl} alt={part.title} className="h-full w-full object-cover" />
                                                                    : <span className="font-black text-slate-400 text-sm">{pi + 1}</span>}
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="font-black text-slate-900">{part.title}</p>
                                                                {part.description && <p className="text-xs text-slate-500 font-medium mt-0.5">{part.description}</p>}
                                                            </div>
                                                        </div>
                                                        {part.members && part.members.length > 0 && (
                                                            <div className="pl-13 text-left">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-14 text-left">Membres</p>
                                                                <div className="flex flex-wrap gap-2 ml-14 text-left">
                                                                    {part.members.map(m => (
                                                                        <div key={m.id} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-left">
                                                                            <div className="h-5 w-5 rounded-md bg-slate-100 overflow-hidden flex items-center justify-center text-center">
                                                                                {m.photoUrl
                                                                                    ? <img src={m.photoUrl} alt={m.name} className="h-full w-full object-cover" />
                                                                                    : <UserCircleIcon className="w-4 h-4 text-slate-400" />}
                                                                            </div>
                                                                            <span className="text-xs font-semibold text-slate-700">{m.name}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {(!isSubmitted && !isSubmittingAll) ? (
                                            <div className="flex gap-4 pt-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openInvalidateDialog(session.address, userIsModerator); }}
                                                    disabled={isLocked}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 border-2 rounded-2xl font-bold transition-all text-center
                                                    ${isLocked ? 'border-slate-200 text-slate-400 cursor-not-allowed opacity-50' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
                                                >
                                                    <XCircleIcon className="w-5 h-5" />
                                                    {decision.status === 'invalidate' ? 'Modifier Invalidation' : 'Invalider'}
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleValidate(session.address); }}
                                                    disabled={isLocked}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black shadow-lg transition-all text-center
                                                    ${isLocked ? 'bg-slate-400 text-white cursor-not-allowed opacity-50 shadow-none' : (decision.status === 'validate' ? 'bg-primary-700' : 'bg-primary-600') + ' hover:bg-primary-700 text-white shadow-primary-500/20'}`}
                                                >
                                                    <CheckCircleIcon className="w-5 h-5" />
                                                    {decision.status === 'validate' ? 'Validé (Brouillon)' : 'Valider'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={`rounded-2xl p-4 border flex items-start gap-3 text-left
                                                ${decision.status === 'validated' || decision.status === 'validate'
                                                    ? 'bg-primary-50 border-primary-100'
                                                    : 'bg-red-50 border-red-100'}`}>
                                                {(decision.status === 'validated' || decision.status === 'validate')
                                                    ? <CheckCircleIcon className="w-5 h-5 text-primary-600 shrink-0" />
                                                    : <XCircleIcon className="w-5 h-5 text-red-600 shrink-0" />}
                                                <div>
                                                    <p className={`font-black text-sm ${(decision.status === 'validated' || decision.status === 'validate') ? 'text-primary-700' : 'text-red-700'}`}>
                                                        {(decision.status === 'validated' || decision.status === 'validate') ? 'Session validée.' : 'Session invalidée.'}
                                                    </p>
                                                    {decision.reason && (
                                                        <p className="text-xs text-red-600/80 font-medium mt-1">Raison : {decision.reason}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {!userIsModerator && (
                                            <p className="mt-2 text-[10px] text-amber-600 font-bold italic">
                                                * Vous ne figurez pas dans la liste des modérateurs pour cette session spécifique. Vos décisions ne seront pas prises en compte.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="h-40" />

                {allDecided && !isSubmitted && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-40 text-center">
                        <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col items-center gap-4">
                            <div className="text-center">
                                <h4 className="text-white font-black text-sm tracking-tight">Prêt pour la soumission globale</h4>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                                    {decisionsReachedCount} / {authorizedSessionsCount} session(s) assignée(s) prêtes
                                </p>
                            </div>
                            <button
                                onClick={submitAllDecisions}
                                disabled={isSubmittingAll}
                                className="w-full h-14 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary-900/40"
                            >
                                {isSubmittingAll ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Scellage en cours...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheckIcon className="w-5 h-5" />
                                        Soumettre toutes les décisions
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {isSubmitted && (
                    <div className={`mt-8 rounded-3xl p-8 text-center border text-center
                        ${allValidated
                            ? 'bg-primary-600 border-primary-500'
                            : 'bg-red-600/90 border-red-500'}`}>
                        {allValidated
                            ? <CheckCircleIcon className="w-12 h-12 text-white mx-auto mb-4" />
                            : <XCircleIcon className="w-12 h-12 text-white mx-auto mb-4" />}
                        <h2 className="text-2xl font-black text-white mb-2 text-center">
                            {allValidated ? 'Toutes les sessions validées !' : 'Validation incomplète'}
                        </h2>
                        <p className="text-white/70 font-medium text-sm text-center">
                            {allValidated
                                ? 'Le scrutin peut maintenant être ouvert aux électeurs une fois que tous les modérateurs ont validé.'
                                : 'Certaines sessions ont été invalidées. L\'organisateur sera notifié.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ModeratorPortalPage
