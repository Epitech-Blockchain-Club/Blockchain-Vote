import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    ShieldCheckIcon,
    CheckCircleIcon,
    ChevronRightIcon,
    ArrowLeftIcon,
    UserCircleIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

// Scrutin data loaded from API

// ─── PartyCard ───────────────────────────────────────────────────────────────
const PartyCard = ({ part, selected, onSelect, disabled }) => {
    const [hovered, setHovered] = useState(false)

    return (
        <div
            className={`relative rounded-3xl border-2 transition-all duration-200 cursor-pointer group overflow-visible
        ${selected ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100'
                    : disabled ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                        : 'border-slate-200 bg-white hover:border-primary-300 hover:shadow-md'}`}
            onClick={() => !disabled && onSelect(part.id)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="p-6">
                {/* logo + title */}
                <div className="flex items-center gap-4 mb-3">
                    <div className="h-12 w-12 rounded-2xl border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                        {part.imageUrl
                            ? <img src={part.imageUrl} alt={part.title} className="h-full w-full object-cover" />
                            : <span className="text-lg font-black text-slate-400">{part.title.charAt(0)}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-900 text-base leading-tight truncate">{part.title}</p>
                        {part.members.length > 0 && (
                            <p className="text-xs text-slate-400 font-medium mt-0.5">{part.members.length} membre{part.members.length > 1 ? 's' : ''}</p>
                        )}
                    </div>
                    {selected && <CheckCircleIcon className="w-6 h-6 text-primary-600 shrink-0" />}
                </div>
            </div>

            {/* Hover tooltip */}
            {hovered && (part.description || part.members.length > 0) && (
                <div className="absolute z-50 left-0 top-full mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 pointer-events-none">
                    {/* arrow */}
                    <div className="absolute -top-2 left-8 w-4 h-4 bg-white border-l border-t border-slate-100 rotate-45" />

                    {part.imageUrl && (
                        <img src={part.imageUrl} alt={part.title} className="w-full h-24 object-cover rounded-2xl mb-4" />
                    )}

                    <p className="font-black text-slate-900 text-sm mb-2">{part.title}</p>

                    {part.description && (
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{part.description}</p>
                    )}

                    {part.members.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Membres</p>
                            <div className="space-y-2">
                                {part.members.map(m => (
                                    <div key={m.id} className="flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                                            {m.photoUrl
                                                ? <img src={m.photoUrl} alt={m.name} className="h-full w-full object-cover" />
                                                : <UserCircleIcon className="w-5 h-5 text-slate-400" />}
                                        </div>
                                        <span className="text-xs font-semibold text-slate-700">{m.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── VoterPortalPage ──────────────────────────────────────────────────────────
const VoterPortalPage = () => {
    const { id } = useParams()
    const { user } = useAuth()
    const [scrutin, setScrutin] = useState(null)
    const [loading, setLoading] = useState(true)

    // State: which session the voter is currently viewing (null = list view)
    const [activeSessionId, setActiveSessionId] = useState(null)
    // Map of sessionId → chosen partId
    const [votes, setVotes] = useState({})
    // Which sessions have been submitted
    const [submitted, setSubmitted] = useState({})
    // Confirmation step
    const [confirming, setConfirming] = useState(false)
    // All done
    const [allDone, setAllDone] = useState(false)
    // Identity verification
    const [isSocialVerified, setIsSocialVerified] = useState(false)
    const [token, setToken] = useState(null)

    React.useEffect(() => {
        const fetchScrutin = async () => {
            try {
                setLoading(true)
                const urlParams = new URLSearchParams(window.location.search)
                const t = urlParams.get('token')
                setToken(t)

                if (t) {
                    const authRes = await fetch(`http://localhost:3001/api/auth/moderator/verify?token=${t}`)
                    const authResult = await authRes.json()
                    if (authResult.success) {
                        // Logged in as voter
                        localStorage.setItem('user', JSON.stringify({ email: authResult.email, role: 'voter' }))
                    }
                }

                const res = await fetch(`http://localhost:3001/api/scrutins`)
                const result = await res.json()
                if (result.success) {
                    const found = result.data.find(s => s.address === id)
                    if (found) {
                        // Map backend format to UI format
                        const mapped = {
                            id: found.address,
                            title: found.title,
                            description: found.description,
                            scope: found.scope,
                            voteSessions: found.sessions.map((s, idx) => ({
                                id: s.address || `session_${idx}`, // Session address or index
                                index: idx,
                                title: s.title,
                                description: s.description || "Session de vote",
                                parts: (s.options && s.options.length > 0) ? s.options : [
                                    { id: '0', title: 'Option A', members: [] },
                                    { id: '1', title: 'Option B', members: [] },
                                    { id: '2', title: 'Vote Blanc', members: [] }
                                ]
                            }))
                        }
                        setScrutin(mapped)
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
        fetchScrutin()
    }, [id])

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    )

    if (!scrutin) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <p className="font-black text-slate-400">Scrutin introuvable ou erreur de chargement.</p>
        </div>
    )

    const activeSession = scrutin.voteSessions.find(s => s.id === activeSessionId)

    const selectPart = (partId) => {
        setVotes(prev => ({ ...prev, [activeSessionId]: partId }))
    }

    const handleSocialLogin = async (provider) => {
        const width = 600, height = 700
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2
        let url = '';

        try {
            toast.loading("Initialisation sécurisée...", { id: 'oauth-init' });
            const configRes = await fetch('http://localhost:3001/api/auth/oauth-config');
            const config = await configRes.json();
            console.log("OAuth Debug:", { provider, config });
            toast.dismiss('oauth-init');

            if (provider === 'google' && config.googleClientId) {
                // Real Google OAuth Flow
                console.log("OAuth Debug: Using REAL Google Flow");
                url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.googleClientId}&redirect_uri=${encodeURIComponent(window.location.origin + '/oauth-callback')}&response_type=token&scope=email%20profile`;
            } else if (provider === 'microsoft' && config.microsoftClientId) {
                // Real Microsoft OAuth Flow
                console.log("OAuth Debug: Using REAL Microsoft Flow");
                url = `https://login.microsoftonline.com/${config.microsoftTenantId || 'common'}/oauth2/v2.0/authorize?client_id=${config.microsoftClientId}&response_type=token&redirect_uri=${encodeURIComponent(window.location.origin + '/oauth-callback')}&scope=User.Read%20email%20openid%20profile`;
            } else {
                // Simulation Fallback
                console.log("OAuth Debug: Using SIMULATION Fallback");
                const popupContent = `
                    <html>
                        <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f8fafc; margin: 0; padding: 20px; text-align: center;">
                            <img src="https://www.${provider === 'google' ? 'google' : 'microsoft'}.com/favicon.ico" style="width: 48px; margin-bottom: 20px;">
                            <h2 style="color: #0f172a; margin-bottom: 8px;">Vérification Identity (Simulation)</h2>
                            <p style="color: #64748b; font-size: 14px; margin-bottom: 30px;">Choisissez un compte pour voter sur <b>VoteChain</b></p>
                            <div onclick="window.close()" style="cursor: pointer; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px 25px; display: flex; align-items: center; gap: 15px; width: 100%; max-width: 300px;">
                                <div style="width: 32px; height: 32px; background: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">${user?.email?.charAt(0).toUpperCase() || 'V'}</div>
                                <div style="text-align: left;">
                                    <div style="font-weight: bold; font-size: 14px; color: #1e293b;">${user?.email || 'voter@example.com'}</div>
                                </div>
                            </div>
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
                    // REAL OAUTH SUCCESS
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

                        // Strict Email Check
                        if (email && email.toLowerCase() === user?.email?.toLowerCase()) {
                            setIsSocialVerified(true);
                            toast.success(`Identité validée et certifiée ${provider === 'google' ? 'Google' : 'Microsoft'} ✓`, { id: 'oauth-verify' });
                        } else {
                            toast.error(`Échec: Email saisi (${email || 'Inconnu'}) différent du compte autorisé (${user?.email})`, { id: 'oauth-verify', duration: 6000 });
                        }
                    } catch (err) {
                        toast.error(`Erreur de communication avec ${provider === 'google' ? 'Google' : 'Microsoft'}.`, { id: 'oauth-verify' });
                    }
                } else if (event.data === 'verified') {
                    // SIMULATION SUCCESS
                    window.removeEventListener('message', handleMsg);
                    setIsSocialVerified(true);
                    toast.success('Identité validée ✓');
                }
            };
            window.addEventListener('message', handleMsg);

        } catch (err) {
            toast.error("Impossible de joindre le système d'authentification.");
            toast.dismiss('oauth-init');
        }
    }

    // legacy
    const simulateSocialLogin = (provider) => {

        const width = 600, height = 700
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2

        const popupContent = `
            <html>
                <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f8fafc; margin: 0; padding: 20px; text-align: center;">
                    <img src="https://www.${provider === 'google' ? 'google' : 'microsoft'}.com/favicon.ico" style="width: 48px; margin-bottom: 20px;">
                    <h2 style="color: #0f172a; margin-bottom: 8px;">Vérification Identity</h2>
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 30px;">Choisissez un compte pour voter sur <b>VoteChain</b></p>
                    <div onclick="window.close()" style="cursor: pointer; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px 25px; display: flex; align-items: center; gap: 15px; width: 100%; max-width: 300px;">
                        <div style="width: 32px; height: 32px; background: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">${user?.email?.charAt(0).toUpperCase() || 'V'}</div>
                        <div style="text-align: left;">
                            <div style="font-weight: bold; font-size: 14px; color: #1e293b;">${user?.email || 'voter@example.com'}</div>
                        </div>
                    </div>
                </body>
                <script>
                    window.onunload = () => window.opener.postMessage('verified', '*');
                </script>
            </html>
        `;
        const blob = new Blob([popupContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, 'OAuth2 Verification', `width=${width},height=${height},left=${left},top=${top}`)

        const handleMsg = (event) => {
            if (event.data === 'verified') {
                setIsSocialVerified(true)
                toast.success('Identité Électeur validée ✓')
                window.removeEventListener('message', handleMsg)
            }
        }
        window.addEventListener('message', handleMsg)
    }

    const submitSession = () => {
        if (!votes[activeSessionId]) { toast.error('Veuillez sélectionner une option avant de voter.'); return }
        setConfirming(true)
    }

    const confirmVote = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/votes/cast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: activeSessionId,
                    voterEmail: user?.email || "anonymous",
                    optionIndex: parseInt(votes[activeSessionId])
                })
            })
            const result = await res.json()
            if (result.success) {
                setSubmitted(prev => ({ ...prev, [activeSessionId]: true }))
                setConfirming(false)
                setActiveSessionId(null)
                toast.success('Vote enregistré sur la blockchain !')

                const newSubmitted = { ...submitted, [activeSessionId]: true }
                if (scrutin.voteSessions.every(s => newSubmitted[s.id])) {
                    setTimeout(() => setAllDone(true), 600)
                }
            } else {
                throw new Error(result.error)
            }
        } catch (err) {
            toast.error('Erreur: ' + err.message)
        }
    }

    // ── All done screen ──────────────────────────────────────────────────────
    if (allDone) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50/30 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl border border-slate-100 p-12 text-center">
                    <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircleIcon className="w-10 h-10 text-primary-600" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Votes enregistrés !</h1>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8">
                        Tous vos votes ont été enregistrés de façon chiffrée sur la blockchain. Vous recevrez une preuve de vote par email.
                    </p>
                    <div className="flex items-center justify-center gap-3 py-4 px-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
                        <span className="text-sm font-bold text-slate-700">Protégé par VoteChain Blockchain</span>
                    </div>
                </div>
            </div>
        )
    }

    // ── Session detail view (vote) ───────────────────────────────────────────
    if (activeSession) {
        const chosenPart = activeSession.parts.find(p => p.id === votes[activeSessionId])
        const alreadySubmitted = submitted[activeSessionId]

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50/20 p-6">
                <div className="max-w-2xl mx-auto">
                    {/* Back button */}
                    <button onClick={() => { setActiveSessionId(null); setConfirming(false) }}
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 mb-8 transition-colors">
                        <ArrowLeftIcon className="w-4 h-4" /> Retour aux sessions
                    </button>

                    {/* Session header */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mb-6">
                        <span className="inline-block text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full mb-4">Session de vote</span>
                        <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">{activeSession.title}</h1>
                        {activeSession.description && (
                            <p className="text-slate-500 font-medium">{activeSession.description}</p>
                        )}
                    </div>

                    {alreadySubmitted ? (
                        <div className="bg-primary-50 border border-primary-100 rounded-3xl p-8 text-center">
                            <CheckCircleIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                            <p className="font-black text-primary-700 text-lg">Vote déjà enregistré pour cette session.</p>
                            <p className="text-primary-600/70 text-sm font-medium mt-2">Votre choix : <span className="font-black">{activeSession.parts.find(p => p.id === votes[activeSessionId])?.title}</span></p>
                        </div>
                    ) : confirming ? (
                        /* Confirmation modal inline */
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8">
                            <h2 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Confirmer votre vote</h2>
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Votre choix</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
                                        {chosenPart?.imageUrl
                                            ? <img src={chosenPart.imageUrl} alt={chosenPart.title} className="h-full w-full object-cover rounded-2xl" />
                                            : <span className="font-black text-slate-500 text-lg">{chosenPart?.title.charAt(0)}</span>}
                                    </div>
                                    <p className="font-black text-slate-900 text-lg">{chosenPart?.title}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-7">
                                <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-amber-700 text-sm font-medium">Cette action est irréversible. Votre vote sera chiffré et inscrit définitivement sur la blockchain.</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setConfirming(false)}
                                    className="flex-1 py-3.5 border-2 border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                                    Annuler
                                </button>
                                <button onClick={confirmVote}
                                    className="flex-1 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black shadow-lg shadow-primary-500/20 transition-all">
                                    Confirmer mon vote
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Party cards */
                        <div className="space-y-4">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                                Survolez une option pour voir les détails · Cliquez pour sélectionner
                            </p>
                            {activeSession.parts.map(part => (
                                <PartyCard
                                    key={part.id}
                                    part={part}
                                    selected={votes[activeSessionId] === part.id}
                                    onSelect={selectPart}
                                    disabled={false}
                                />
                            ))}
                            <button
                                onClick={submitSession}
                                disabled={!votes[activeSessionId]}
                                className={`w-full mt-4 py-4 rounded-2xl font-black text-base transition-all
                  ${votes[activeSessionId]
                                        ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                                {votes[activeSessionId] ? (isSocialVerified ? 'Valider mon choix →' : 'Vérifiez votre identité pour voter') : 'Sélectionnez une option pour continuer'}
                            </button>

                            {!isSocialVerified && votes[activeSessionId] && (
                                <div className="mt-4 p-6 bg-primary-600 rounded-3xl text-white shadow-xl">
                                    <p className="font-black text-sm mb-4">Vérification d'Identité Requise</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleSocialLogin('google')} className="flex-1 bg-white text-primary-600 py-2 rounded-xl text-[10px] font-black uppercase">Google</button>
                                        <button onClick={() => handleSocialLogin('microsoft')} className="flex-1 bg-white text-primary-600 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm">Office 365</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // ── Session list view ────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50/20 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Scrutin header */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <ShieldCheckIcon className="w-8 h-8 text-primary-600" />
                        <div>
                            <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Scrutin · VoteChain</p>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{scrutin.title}</h1>
                        </div>
                    </div>
                    {scrutin.description && <p className="text-slate-500 font-medium text-sm leading-relaxed">{scrutin.description}</p>}
                </div>

                {/* Session cards */}
                <div className="mb-6">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                        {scrutin.voteSessions.length} session{scrutin.voteSessions.length > 1 ? 's' : ''} de vote à compléter
                    </p>
                    <div className="space-y-3">
                        {scrutin.voteSessions.map((session, i) => {
                            const done = submitted[session.id]
                            return (
                                <button key={session.id} onClick={() => setActiveSessionId(session.id)}
                                    className={`w-full text-left rounded-3xl border-2 p-5 transition-all flex items-center gap-5 group
                    ${done
                                            ? 'border-primary-100 bg-primary-50/60'
                                            : 'border-slate-200 bg-white hover:border-primary-300 hover:shadow-md'}`}>
                                    {/* number / done badge */}
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm
                    ${done ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors'}`}>
                                        {done ? <CheckCircleIcon className="w-6 h-6" /> : i + 1}
                                    </div>
                                    {/* info */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-black text-base truncate ${done ? 'text-primary-700' : 'text-slate-900'}`}>{session.title}</p>
                                        {session.description && <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{session.description}</p>}
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{session.parts.length} option{session.parts.length > 1 ? 's' : ''}</p>
                                    </div>
                                    {/* arrow or done */}
                                    <div className="shrink-0">
                                        {done
                                            ? <span className="text-[10px] font-black text-primary-600 uppercase tracking-wider bg-primary-100 px-2 py-1 rounded-lg">Voté ✓</span>
                                            : <ChevronRightIcon className="w-5 h-5 text-slate-400 group-hover:text-primary-600 transition-colors" />}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Progress */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4">
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full bg-primary-600 rounded-full transition-all duration-500"
                            style={{ width: `${(Object.keys(submitted).length / scrutin.voteSessions.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-xs font-black text-slate-500 shrink-0">
                        {Object.keys(submitted).length} / {scrutin.voteSessions.length} complété{Object.keys(submitted).length > 1 ? 's' : ''}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default VoterPortalPage
