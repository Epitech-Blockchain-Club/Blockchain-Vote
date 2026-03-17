import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { useElections } from '../../contexts/ElectionContext'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../common/Button'
import Card from '../common/Card'
import CountdownTimer from '../common/CountdownTimer'
import { useSettings } from '../../contexts/SettingsContext'
import {
    ArrowLeftIcon,
    PencilSquareIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    UserGroupIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    TrophyIcon,
    DocumentCheckIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline'

const AdminElectionDetail = () => {
    const { id } = useParams()
    const { elections, loading, refreshElections } = useElections()
    const { t } = useSettings()
    const { authToken } = useAuth()
    const navigate = useNavigate()
    const [isRefreshing, setIsRefreshing] = React.useState(false)
    const [togglingResults, setTogglingResults] = useState(false)
    const qrRef = useRef(null)
    const API_BASE = import.meta.env.VITE_API_URL
    const PUBLIC_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin

    const downloadQR = () => {
        const canvas = qrRef.current?.querySelector('canvas')
        if (!canvas) return
        const a = document.createElement('a')
        a.download = `epivote-qrcode-${election?.id?.slice(0, 8) || 'vote'}.png`
        a.href = canvas.toDataURL('image/png')
        a.click()
    }

    const toggleResultsVisibility = async () => {
        if (!election) return
        setTogglingResults(true)
        try {
            const res = await fetch(`${API_BASE}/scrutins/${election.id}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
                body: JSON.stringify({ showResultsToVoters: !election.showResultsToVoters })
            })
            const result = await res.json()
            if (result.success) {
                await refreshElections()
                toast.success(election.showResultsToVoters ? 'Résultats masqués aux votants' : 'Résultats visibles aux votants')
            } else {
                toast.error('Erreur lors de la mise à jour')
            }
        } catch {
            toast.error('Erreur réseau')
        } finally {
            setTogglingResults(false)
        }
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await refreshElections()
        setIsRefreshing(false)
    }

    const election = elections.find(e => e.id === id)
    const [expandedPart, setExpandedPart] = React.useState(null)

    console.log('⚡ [RENDER] AdminElectionDetail. ID:', id, 'Found:', !!election);
    if (election) console.log('🗳️ [STATS] Election Votes in Detail:', election.votes);

    const exportToCSV = (voters, sessionTitle) => {
        if (!voters || voters.length === 0) {
            toast.error("Aucun électeur à exporter");
            return;
        }
        const csvContent = "data:text/csv;charset=utf-8," + ["Email"].concat(voters).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `electeurs_${sessionTitle.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV exporté avec succès !");
    }

    // Log consensus and detailed stats
    React.useEffect(() => {
        if (election) {
            const total = election.sessions?.reduce((acc, s) => acc + (s.moderatorCount || 0), 0) || 0
            const validated = election.sessions?.reduce((acc, s) => acc + (s.validationCount || 0), 0) || 0
            const percentage = total > 0 ? Math.round((validated / total) * 100) : 0

            const totalVotes = Object.values(election.votes || {}).reduce((a, b) => a + (parseInt(b) || 0), 0)
            const participation = ((totalVotes / (election.voterCount || 1)) * 100).toFixed(1)

            console.log(`🛡️ [ADMIN] Moderator Consensus: ${validated}/${total} validations (${percentage}%)`);
            console.log(`📊 [ADMIN] Election Detail Stats:`, {
                id: election.id,
                title: election.title,
                votes: election.votes,
                totalVotes,
                participation: `${participation}%`,
                voterCount: election.voterCount
            });
        }
    }, [election])

    if (loading && !election) return (
        <div className="flex flex-col items-center justify-center py-40">
            <div className="h-12 w-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Chargement du scrutin...</p>
            <button onClick={handleRefresh} className="mt-6 text-xs font-bold text-primary-600 underline hover:text-primary-800">Rafraîchir manuellement</button>
        </div>
    )

    if (!election) {
        return (
            <div className="text-center py-20 bg-white transition-colors duration-300">
                <h2 className="text-2xl font-black text-slate-900">
                    {t({ fr: 'Scrutin introuvable', en: 'Ballot not found' })}
                </h2>
                <Button onClick={() => navigate('/admin')} className="mt-4">
                    {t({ fr: 'Retour au Dashboard', en: 'Back to Dashboard' })}
                </Button>
            </div>
        )
    }

    const now = new Date()
    const start = new Date(election.startDate)
    const end = new Date(election.endDate)
    let status = 'Terminé'
    let statusColor = 'bg-slate-50 text-slate-600 border-slate-200'

    if (now < start) {
        status = 'Planifié'
        statusColor = 'bg-amber-50 text-amber-600 border-amber-200'
    } else if (now <= end) {
        status = 'En cours'
        statusColor = 'bg-primary-50 text-primary-600 border-primary-200'
    }

    // Moderator-based stats (True Consensus)
    const totalModerators = election.sessions?.reduce((acc, s) => acc + (s.moderatorCount || 0), 0) || 0
    const totalValidations = election.sessions?.reduce((acc, s) => acc + (s.validationCount || 0), 0) || 0

    // Real consensus calculation using moderator tally
    const consensusPercentage = totalModerators > 0 ? Math.round((totalValidations / totalModerators) * 100) : 0
    const isConsensusReached = consensusPercentage === 100

    const totalSessions = election.sessions?.length || 0
    const validatedSessions = election.sessions?.filter(s => s.isValidated).length || 0

    return (
        <div className="animate-fade-in pb-20 bg-white min-h-screen">
            {/* Header Bar */}
            <div className="flex flex-wrap items-start gap-3 sm:gap-4 mb-6 pt-6 sm:pt-10 px-4 md:px-0 max-w-7xl mx-auto">
                {/* Row 1: nav buttons + title */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Link to="/admin" className="p-2.5 sm:p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-colors shadow-sm shrink-0">
                        <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
                    </Link>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="p-2.5 sm:p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-colors shadow-sm disabled:opacity-50 shrink-0"
                        title="Actualiser l'état blockchain"
                    >
                        <svg className={`h-5 w-5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                    {/* Title + Logo */}
                    <div className="flex flex-1 flex-wrap items-start gap-4 min-w-0">
                        {election.logoUrl && (
                            <div className="h-12 w-12 sm:h-20 sm:w-20 bg-white rounded-2xl border-2 border-slate-100 shadow-xl flex-shrink-0 flex items-center justify-center p-2">
                                <img src={election.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColor}`}>{status}</span>
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary-50 text-primary-600 border border-primary-100">{election.type || 'Standard'}</span>
                            </div>
                            <h1 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">{election.title}</h1>
                            <p className="text-slate-500 font-medium text-sm mt-1 line-clamp-2">{election.description}</p>
                        </div>
                    </div>
                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto px-4 md:px-0">

                {/* Main Info */}
                <div className="md:col-span-2 space-y-8">
                    <Card className="bg-white border-slate-100 shadow-sm p-8">
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">Informations Principales</h2>
                        <p className="text-slate-600 font-medium mb-6 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            {election.description || "Aucune description fournie pour ce scrutin."}
                        </p>
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Périmètre / Scope</p>
                                <p className="text-sm font-black text-slate-900 uppercase">{election.scope || election.type || 'Non défini'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nombre d'inscrits</p>
                                <p className="text-sm font-black text-slate-900">{election.voters?.length || 0} électeurs</p>
                            </div>
                        </div>
                        <CountdownTimer startDate={election.startDate} endDate={election.endDate} />
                    </Card>

                    <Card className="bg-white border-slate-100 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2">
                                <TrophyIcon className="w-5 h-5 text-amber-500" />
                                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest ">Sessions & Options de Vote</h2>
                            </div>
                        </div>
                        <div className="space-y-8">
                            {election.sessions?.length > 0 ? election.sessions.map((session, sIdx) => (
                                <div key={sIdx} className="space-y-4">
                                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div>
                                            <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">Session {sIdx + 1}</p>
                                            <h3 className="text-lg font-black text-slate-900">{session.title}</h3>
                                        </div>
                                        <div className="flex flex-col items-end gap-3">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${session.isInvalidated ? 'bg-rose-500 text-white border-rose-600' :
                                                session.isValidated ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                {session.isInvalidated ? 'Invalidée ✖' : session.isValidated ? 'Validée ✓' : 'En validation'}
                                            </span>
                                            {session.isInvalidated && session.invalidationReason && (
                                                <span className="text-[10px] text-rose-500 font-bold italic max-w-[200px] text-right">
                                                    "{session.invalidationReason}"
                                                </span>
                                            )}

                                        </div>
                                    </div>

                                    {/* Per-Session Stats & Consensus */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                                        <Card className="bg-slate-900 text-white p-6 rounded-[24px] border-none relative overflow-hidden">
                                            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-32 h-32 bg-secondary-500/10 blur-2xl rounded-full"></div>
                                            <h2 className="text-[9px] font-black text-secondary-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                                                <ShieldCheckIcon className="w-3.5 h-3.5 mr-2" /> Consensus Modérateurs
                                            </h2>
                                            <div className="flex items-end gap-2 mb-2">
                                                <span className="text-3xl font-black">{session.consensusPercentage}%</span>
                                                <span className={`text-[9px] font-bold mb-1 ${session.isValidated ? 'text-secondary-400' : 'text-slate-400'}`}>
                                                    {session.isValidated ? 'Valide' : 'En validation'}
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
                                                <div className="bg-secondary-500 h-full rounded-full transition-all duration-500" style={{ width: `${session.consensusPercentage}%` }}></div>
                                            </div>
                                            <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/10">
                                                <span className="text-[8px] font-black uppercase text-slate-400">Validations Modérateurs</span>
                                                <span className="text-xs font-black text-secondary-400">{session.validationCount} / {session.moderatorCount}</span>
                                            </div>
                                        </Card>

                                        <Card className="bg-white border-slate-100 p-6 rounded-[24px] shadow-sm">
                                            <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                                                <ChartBarIcon className="w-3.5 h-3.5 mr-2" /> Statistiques Live
                                            </h2>
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between items-end mb-1">
                                                        <span className="text-[8px] font-bold text-slate-500 uppercase">Participation</span>
                                                        <span className="text-sm font-black text-primary-600">
                                                            {session.voterCount > 0 ? ((session.voters?.length || 0) / session.voterCount * 100).toFixed(1) : 0}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden border border-slate-100">
                                                        <div
                                                            className="bg-primary-500 h-full rounded-full transition-all duration-1000"
                                                            style={{ width: `${session.voterCount > 0 ? ((session.voters?.length || 0) / session.voterCount * 100) : 0}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="text-slate-500 font-medium">Votes Scellés</span>
                                                    <span className="font-bold text-slate-900">
                                                        {Object.values(session.votes || {}).reduce((a, b) => a + (parseInt(b) || 0), 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>

                                    {/* Options de Vote (Bar Charts) */}
                                    <div className="grid grid-cols-1 gap-3 ml-4">
                                        {(session.options || []).map((candidate, candidateIdx) => {
                                            const sessionVotes = session.votes || {}
                                            const voteCount = sessionVotes[candidateIdx] || 0
                                            const totalVotesInSession = Object.values(sessionVotes).reduce((a, b) => a + (parseInt(b) || 0), 0)
                                            const percentage = totalVotesInSession > 0 ? ((voteCount / totalVotesInSession) * 100).toFixed(1) : 0

                                            return (
                                                <div key={candidateIdx} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-100">
                                                        {candidate.imageUrl ? <img src={candidate.imageUrl} alt="" className="h-full w-full object-cover" /> : <span className="font-black text-slate-300">{candidateIdx + 1}</span>}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-slate-900 text-sm">{candidate.title}</h4>
                                                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2">
                                                            <div className="bg-primary-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-sm font-black text-primary-600">{percentage}%</span>
                                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{voteCount} votes</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Moderator & Voter Lists */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                                        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <ShieldCheckIcon className="w-3 h-3" /> Liste des Modérateurs
                                            </h4>
                                            <div className="space-y-3">
                                                {session.moderators?.length > 0 ? session.moderators.map((mod, mIdx) => (
                                                    <div key={mIdx} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-slate-100">
                                                        <span className="font-medium text-slate-600 truncate max-w-[150px]">{mod.email}</span>
                                                        <span className={`font-black uppercase tracking-tighter px-2 py-0.5 rounded-md text-[9px] ${mod.status === 'Validé' ? 'bg-emerald-100 text-emerald-700' : mod.status === 'Invalidé' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-400'
                                                            }`}>
                                                            {mod.status}
                                                        </span>
                                                    </div>
                                                )) : <p className="text-[10px] text-slate-400 italic">Aucun modérateur assigné.</p>}
                                            </div>
                                        </div>

                                        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                    <UserGroupIcon className="w-3 h-3" /> Liste des Électeurs
                                                </h4>
                                                <button
                                                    onClick={() => exportToCSV(session.voters, session.title)}
                                                    className="text-[9px] font-black text-primary-600 hover:text-white hover:bg-primary-600 border border-primary-200 px-2 py-1 rounded-lg transition-all"
                                                >
                                                    Exporter CSV
                                                </button>
                                            </div>
                                            <div className="max-h-[120px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                                {session.voters?.length > 0 ? session.voters.map((voter, vIdx) => (
                                                    <div key={vIdx} className="text-[10px] font-medium text-slate-500 bg-white p-2 rounded-lg border border-slate-100/50">
                                                        {voter}
                                                    </div>
                                                )) : <p className="text-[10px] text-slate-400 italic">Aucun électeur importé.</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-[32px]">
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucune session configurée</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Voter Access Section - ONLY IF CONSENSUS IS 100% */}
                    {isConsensusReached ? (
                        <Card className="bg-primary-600 text-white shadow-xl shadow-primary-900/30 p-8 rounded-[40px] border-none overflow-hidden relative">
                            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>

                            <div className="relative z-10 w-full flex flex-col lg:flex-row items-center lg:items-center gap-8">
                                <div className="flex flex-col items-center gap-3 shrink-0">
                                    <div ref={qrRef} className="p-4 bg-white rounded-3xl shadow-2xl">
                                        <QRCodeCanvas
                                            value={`${PUBLIC_URL}/vote/${election.id}`}
                                            size={160}
                                            level="H"
                                            includeMargin={false}
                                        />
                                    </div>
                                    <button
                                        onClick={downloadQR}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors border border-white/30"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        Télécharger
                                    </button>
                                </div>
                                <div className="flex-1 min-w-0 text-center lg:text-left">
                                    <h2 className="text-2xl font-black mb-2 tracking-tight">Accès Électeurs Activé</h2>
                                    <p className="text-primary-100 font-medium mb-6 leading-relaxed text-sm">
                                        Le consensus a été atteint. Le vote est désormais ouvert pour tous les participants autorisés.
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/20">
                                        <div className="flex-1 px-3 py-2 font-mono text-[10px] overflow-hidden text-ellipsis whitespace-nowrap min-w-0 opacity-80">
                                            {PUBLIC_URL}/vote/{election.id}
                                        </div>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${PUBLIC_URL}/vote/${election.id}`)
                                                toast.success('Lien de vote copié !')
                                            }}
                                            className="bg-white text-primary-600 hover:bg-slate-50 border-none px-6 py-2.5 font-black uppercase text-[10px] shrink-0"
                                        >
                                            Copier le lien
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card className="bg-slate-50 border-2 border-dashed border-slate-200 p-10 rounded-[40px] text-center">
                            <div className="max-w-md mx-auto">
                                <ShieldCheckIcon className="h-16 w-16 text-slate-300 mx-auto mb-6" />
                                <h3 className="text-xl font-black text-slate-900 mb-3">Accès Électeurs Suspendu</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    Le lien de vote et le QR Code ne seront générés qu'une fois que **100% des sessions** auront été validées par les modérateurs.
                                </p>
                                <div className="mt-8 pt-8 border-t border-slate-200">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">État actuel</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-2xl font-black text-slate-400">{validatedSessions} / {totalSessions}</span>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sessions Validées</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Sidebar - Quick info summary instead of redundant global stats */}
                <div className="space-y-8">
                    <Card className="bg-slate-900 text-white shadow-xl shadow-slate-900/20 p-8 rounded-[32px] border-none relative overflow-hidden">
                        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-40 h-40 bg-primary-500/20 blur-3xl rounded-full"></div>
                        <h2 className="text-xs font-black text-primary-400 uppercase tracking-[0.2em] mb-8 relative z-10 flex items-center">
                            <DocumentCheckIcon className="w-4 h-4 mr-2" /> Résumé Global
                        </h2>
                        <div className="relative z-10 space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Sessions</p>
                                <p className="text-2xl font-black text-white">{totalSessions}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sessions Validées</p>
                                <p className="text-2xl font-black text-secondary-400">{validatedSessions} / {totalSessions}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Participation Moyenne</p>
                                <p className="text-2xl font-black text-primary-400">
                                    {((election.voters?.length || 0) / (election.voterCount || 1) * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white border-slate-100 shadow-sm p-8">
                        <div className="flex items-center gap-3 mb-6 p-4 bg-primary-50/50 rounded-2xl border border-primary-100">
                            <InformationCircleIcon className="w-5 h-5 text-primary-600" />
                            <p className="text-[10px] text-primary-800 font-bold leading-relaxed uppercase tracking-wider">
                                Données certifiées Blockchain
                            </p>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
                            <div>
                                <p className="text-xs font-black text-slate-900 mb-0.5">Résultats visibles</p>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Les votants peuvent consulter les résultats</p>
                            </div>
                            <button
                                onClick={toggleResultsVisibility}
                                disabled={togglingResults}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${election.showResultsToVoters ? 'bg-primary-600' : 'bg-slate-200'}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${election.showResultsToVoters ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    )
}

export default AdminElectionDetail
