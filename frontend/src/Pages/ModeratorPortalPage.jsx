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
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

// Scrutin data loaded from API

// ─── Helpers ──────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-start py-3 border-b border-slate-100 last:border-0">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-bold text-slate-700 text-right max-w-xs">{value}</span>
    </div>
)

const StatusBadge = ({ status }) => {
    const map = {
        pending: { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
        validated: { label: 'Validé', cls: 'bg-primary-100 text-primary-700' },
        invalidated: { label: 'Invalidé', cls: 'bg-red-100 text-red-700' },
    }
    const { label, cls } = map[status] || map.pending
    return <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${cls}`}>{label}</span>
}

// ─── ModeratorPortalPage ──────────────────────────────────────────────────────
const ModeratorPortalPage = () => {
    const { id, sessionId } = useParams()
    const { user } = useAuth()
    const [scrutin, setScrutin] = useState(null)
    const [loading, setLoading] = useState(true)

    // Per-session decision state: { [sessionId]: { status, reason } }
    const [decisions, setDecisions] = useState({})
    const [expandedSessions, setExpandedSessions] = useState({})
    const [showReasonFor, setShowReasonFor] = useState(null) // sessionId asking for invalidation reason
    const [reasonDraft, setReasonDraft] = useState('')

    React.useEffect(() => {
        const fetchScrutin = async () => {
            try {
                setLoading(true)
                const res = await fetch(`http://localhost:3001/api/scrutins`)
                const result = await res.json()
                if (result.success) {
                    const found = result.data.find(s => s.address === id)
                    if (found) {
                        setScrutin(found)
                        // Initialize states
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
        fetchScrutin()
    }, [id])

    const sessionsToShow = scrutin
        ? (sessionId ? scrutin.sessions.filter(s => s.address === sessionId) : scrutin.sessions)
        : []

    const toggleExpand = (sid) => setExpandedSessions(prev => ({ ...prev, [sid]: !prev[sid] }))

    const handleVoteDecision = async (sid, decision, reason = '') => {
        try {
            const res = await fetch('http://localhost:3001/api/moderators/decision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: sid,
                    moderatorEmail: user?.email || "mod@example.com",
                    decision: decision,
                    reason: reason
                })
            })
            const result = await res.json()
            if (result.success) {
                setDecisions(prev => ({ ...prev, [sid]: { status: decision, reason } }))
                toast.success(decision === 'validate' ? 'Session validée ✓ (Admin notifié par mail)' : 'Session invalidée (Admin notifié).', {
                    icon: decision === 'validate' ? '✅' : '❌',
                    duration: 4000
                })
            } else {
                throw new Error(result.error)
            }
        } catch (err) {
            toast.error('Erreur: ' + err.message)
        }
    }

    const handleValidate = (sid) => handleVoteDecision(sid, 'validate')

    const openInvalidateDialog = (sid) => {
        setShowReasonFor(sid)
        setReasonDraft('')
    }

    const confirmInvalidate = () => {
        if (!reasonDraft.trim()) { toast.error('Veuillez saisir une justification.'); return }
        handleVoteDecision(showReasonFor, 'invalidate', reasonDraft.trim())
        setShowReasonFor(null)
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
        </div>
    )

    if (!scrutin) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <p className="font-black text-slate-400">Scrutin introuvable ou erreur de chargement.</p>
        </div>
    )

    // Authorization check
    const isAuthorized = sessionsToShow.some(s => (s.moderators || []).includes(user?.email))
    if (!isAuthorized && user?.role !== 'superadmin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 px-6">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-12 text-center">
                    <XCircleIcon className="h-20 w-20 text-red-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-white mb-4">Accès Refusé</h2>
                    <p className="text-slate-400 font-medium mb-8">
                        Votre compte ({user?.email}) n'est pas enregistré comme modérateur pour ce scrutin.
                        Veuillez vous connecter avec l'adresse email autorisée.
                    </p>
                    <button onClick={() => window.location.href = '/login'} className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black transition-all">
                        Changer de compte
                    </button>
                </div>
            </div>
        )
    }

    const allDecided = sessionsToShow.every(s => decisions[s.address]?.status !== 'pending')
    const allValidated = sessionsToShow.every(s => decisions[s.address]?.status === 'validate')

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            {/* Invalidation reason modal */}
            {showReasonFor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <XCircleIcon className="w-8 h-8 text-red-500" />
                            <div>
                                <h3 className="font-black text-slate-900 text-lg">Invalider la session</h3>
                                <p className="text-xs text-slate-400 font-medium">
                                    {scrutin.voteSessions.find(s => s.id === showReasonFor)?.title}
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
                                Confirmer l'invalidation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto">
                {/* Portal header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-900/30">
                        <ShieldCheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Portail Modérateur · VoteChain</p>
                        <h1 className="text-2xl font-black text-white tracking-tight leading-tight">Validation du Scrutin</h1>
                    </div>
                </div>

                {/* Scrutin summary */}
                <div className="bg-white/5 backdrop-blur rounded-3xl border border-white/10 p-6 mb-6">
                    <h2 className="text-xs font-black text-white/50 uppercase tracking-widest mb-4">Informations du Scrutin</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                {/* Instruction banner */}
                <div className="bg-amber-500/10 border border-amber-400/20 rounded-2xl px-5 py-4 mb-8 flex items-start gap-3">
                    <ShieldCheckIcon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-amber-200 text-sm font-medium leading-relaxed">
                        En tant que modérateur, votre validation est requise pour chaque session. Un seul refus suffit à bloquer l'ouverture de la session concernée.
                    </p>
                </div>

                {/* Sessions to validate */}
                <div className="space-y-6">
                    {sessionsToShow.map((session, si) => {
                        const decision = decisions[session.address]
                        const expanded = expandedSessions[session.address]

                        return (
                            <div key={session.address} className={`bg-white rounded-3xl shadow-xl overflow-hidden border-2
                ${decision.status === 'validate' ? 'border-primary-200'
                                    : decision.status === 'invalidate' ? 'border-red-200'
                                        : 'border-transparent'}`}>

                                {/* Session header */}
                                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/60 cursor-pointer"
                                    onClick={() => toggleExpand(session.address)}>
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 text-sm font-black flex items-center justify-center">{si + 1}</span>
                                        <div>
                                            <p className="font-black text-slate-900 text-base leading-tight">{session.title}</p>
                                            <div className="mt-1"><StatusBadge status={decision.status} /></div>
                                        </div>
                                    </div>
                                    <button className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors">
                                        {expanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                                    </button>
                                </div>

                                {expanded && (
                                    <div className="p-6 space-y-6">
                                        {/* Session info */}
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <DocumentTextIcon className="w-3.5 h-3.5" /> Informations de la session
                                            </p>
                                            <div className="bg-slate-50 rounded-2xl border border-slate-100 px-4 divide-y divide-slate-100">
                                                <InfoRow label="Titre" value={session.title} />
                                                {session.description && <InfoRow label="Description" value={session.description} />}
                                                <InfoRow label="Électeurs estimés" value={`${session.voterCount || 0} votants`} />
                                                <InfoRow label="Options de vote" value={`${session.options ? session.options.length : 0} choix`} />
                                            </div>
                                        </div>

                                        {/* Candidates / Parts */}
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <UsersIcon className="w-3.5 h-3.5" /> Options / Listes candidates
                                            </p>
                                            <div className="space-y-4">
                                                {(session.options || []).map((part, pi) => (
                                                    <div key={pi} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                                                                {part.imageUrl
                                                                    ? <img src={part.imageUrl} alt={part.title} className="h-full w-full object-cover" />
                                                                    : <span className="font-black text-slate-400 text-sm">{pi + 1}</span>}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-900">{part.title}</p>
                                                                {part.description && <p className="text-xs text-slate-500 font-medium mt-0.5">{part.description}</p>}
                                                            </div>
                                                        </div>
                                                        {part.members.length > 0 && (
                                                            <div className="pl-13">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-14">Membres</p>
                                                                <div className="flex flex-wrap gap-2 ml-14">
                                                                    {part.members.map(m => (
                                                                        <div key={m.id} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
                                                                            <div className="h-5 w-5 rounded-md bg-slate-100 overflow-hidden flex items-center justify-center">
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

                                        {/* Decision area */}
                                        {decision.status === 'pending' ? (
                                            <div className="flex gap-4 pt-2">
                                                <button onClick={() => openInvalidateDialog(session.id)}
                                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-2xl font-bold transition-all">
                                                    <XCircleIcon className="w-5 h-5" /> Invalider
                                                </button>
                                                <button onClick={() => handleValidate(session.id)}
                                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black shadow-lg shadow-primary-500/20 transition-all">
                                                    <CheckCircleIcon className="w-5 h-5" /> Valider
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={`rounded-2xl p-4 border flex items-start gap-3
                        ${decision.status === 'validated'
                                                    ? 'bg-primary-50 border-primary-100'
                                                    : 'bg-red-50 border-red-100'}`}>
                                                {decision.status === 'validated'
                                                    ? <CheckCircleIcon className="w-5 h-5 text-primary-600 shrink-0" />
                                                    : <XCircleIcon className="w-5 h-5 text-red-600 shrink-0" />}
                                                <div>
                                                    <p className={`font-black text-sm ${decision.status === 'validated' ? 'text-primary-700' : 'text-red-700'}`}>
                                                        {decision.status === 'validated' ? 'Session validée par vous.' : 'Session invalidée par vous.'}
                                                    </p>
                                                    {decision.reason && (
                                                        <p className="text-xs text-red-600/80 font-medium mt-1">Raison : {decision.reason}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Summary panel */}
                {allDecided && (
                    <div className={`mt-8 rounded-3xl p-8 text-center border
            ${allValidated
                            ? 'bg-primary-600 border-primary-500'
                            : 'bg-red-600/90 border-red-500'}`}>
                        {allValidated
                            ? <CheckCircleIcon className="w-12 h-12 text-white mx-auto mb-4" />
                            : <XCircleIcon className="w-12 h-12 text-white mx-auto mb-4" />}
                        <h2 className="text-2xl font-black text-white mb-2">
                            {allValidated ? 'Toutes les sessions validées !' : 'Validation incomplète'}
                        </h2>
                        <p className="text-white/70 font-medium text-sm">
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
