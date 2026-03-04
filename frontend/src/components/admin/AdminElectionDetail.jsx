import React from 'react'
import toast from 'react-hot-toast'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useElections } from '../../contexts/ElectionContext'
import Button from '../common/Button'
import Card from '../common/Card'
import { useSettings } from '../../contexts/SettingsContext'
import {
    ArrowLeftIcon,
    PencilSquareIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    UserGroupIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    TrophyIcon
} from '@heroicons/react/24/outline'

const AdminElectionDetail = () => {
    const { id } = useParams()
    const { elections, loading } = useElections()
    const { t } = useSettings()
    const navigate = useNavigate()

    const election = elections.find(e => e.id === id)
    const [expandedPart, setExpandedPart] = React.useState(null)

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40">
            <div className="h-12 w-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Chargement du scrutin...</p>
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

    // Real consensus calculation using session statuses
    const totalSessions = election.sessions?.length || 0
    const validatedSessions = election.sessions?.filter(s => s.isValidated).length || 0
    const consensusPercentage = totalSessions > 0 ? Math.round((validatedSessions / totalSessions) * 100) : 0
    const isConsensusReached = consensusPercentage === 100

    return (
        <div className="animate-fade-in pb-20 bg-white transition-colors duration-300 min-h-screen">
            <div className="flex items-center space-x-6 mb-10 pt-10 px-4 md:px-0 max-w-7xl mx-auto">
                <Link to="/admin" className="p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-colors shadow-sm">
                    <ArrowLeftIcon className="h-6 w-6 text-slate-600" />
                </Link>
                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{election.title}</h1>
                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${statusColor}`}>
                                {status}
                            </span>
                        </div>
                        <p className="text-slate-500 font-medium">{t({ fr: 'Gestion détaillée et statistiques du scrutin.', en: 'Detailed management and ballot statistics.' })}</p>
                    </div>
                    <Link to={`/admin/elections/${id}/edit`}>
                        <Button variant="outline" className="shadow-sm bg-white border-slate-200">
                            <PencilSquareIcon className="w-5 h-5 mr-2" />
                            {t({ fr: 'Modifier les paramètres', en: 'Edit Settings' })}
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 md:px-0">

                {/* Main Info */}
                <div className="md:col-span-2 space-y-8">
                    <Card className="bg-white border-slate-100 shadow-sm p-8">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">Informations Principales</h2>
                        <p className="text-slate-600 font-medium mb-6 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            {election.description || "Aucune description fournie pour ce scrutin."}
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Périmètre / Scope</p>
                                <p className="text-sm font-black text-slate-900 uppercase">{election.scope || election.type || 'Non défini'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nombre d'inscrits</p>
                                <p className="text-sm font-black text-slate-900">{election.voters?.length || 0} électeurs</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ouverture</p>
                                <p className="text-sm font-bold text-slate-700">{start.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fermeture</p>
                                <p className="text-sm font-bold text-slate-700">{end.toLocaleString()}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white border-slate-100 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2">
                                <TrophyIcon className="w-5 h-5 text-amber-500" />
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest ">Sessions & Options de Vote</h2>
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
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${session.isValidated ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {session.isValidated ? 'Validée' : 'En validation'}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    const link = `${window.location.origin}/moderator/${election.id}/${session.address || ''}`
                                                    navigator.clipboard.writeText(link)
                                                    toast.success('Lien modérateur copié !')
                                                }}
                                                className="text-[10px] font-black text-secondary-600 hover:text-secondary-700 underline underline-offset-4 uppercase tracking-wider"
                                            >
                                                Copier lien modéra.
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 ml-4">
                                        {(session.options || []).map((candidate, idx) => {
                                            const voteCount = election.votes?.[candidate.id] || 0
                                            const totalVoters = election.voters?.length || 1
                                            const percentage = totalVoters > 0 ? ((voteCount / totalVoters) * 100).toFixed(1) : 0

                                            return (
                                                <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-100">
                                                        {candidate.imageUrl ? <img src={candidate.imageUrl} alt="" className="h-full w-full object-cover" /> : <span className="font-black text-slate-300">{idx + 1}</span>}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-slate-900 text-sm">{candidate.title}</h4>
                                                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2">
                                                            <div className="bg-primary-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-sm font-black text-primary-600">{percentage}%</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
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

                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                <div className="p-4 bg-white rounded-3xl shadow-2xl">
                                    <QRCodeSVG
                                        value={`${window.location.origin}/vote/${election.id}`}
                                        size={180}
                                        level="H"
                                        includeMargin={false}
                                    />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-2xl font-black mb-2 tracking-tight">Accès Électeurs Activé</h2>
                                    <p className="text-primary-100 font-medium mb-6 leading-relaxed">
                                        Le consensus a été atteint. Le portail de vote est désormais ouvert.
                                        Partagez ce QR Code ou le lien ci-dessous avec les participants.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20 font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                            {window.location.origin}/vote/{election.id}
                                        </div>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/vote/${election.id}`)
                                                toast.success('Lien de vote copié !')
                                            }}
                                            className="bg-white text-primary-600 hover:bg-slate-50 border-none px-6 font-black uppercase text-[10px]"
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
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">État actuel</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-2xl font-black text-slate-400">{validatedSessions} / {totalSessions}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sessions Validées</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-8">
                    <Card className="bg-slate-900 text-white shadow-xl shadow-slate-900/20 p-8 rounded-[32px] border-none relative overflow-hidden">
                        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-40 h-40 bg-secondary-500/20 blur-3xl rounded-full"></div>
                        <h2 className="text-xs font-black text-secondary-400 uppercase tracking-[0.2em] mb-8 relative z-10 flex items-center">
                            <ShieldCheckIcon className="w-4 h-4 mr-2" /> Consensus Modérateurs
                        </h2>
                        <div className="relative z-10">
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-5xl font-black">{consensusPercentage}%</span>
                                <span className={`text-${isConsensusReached ? 'secondary' : 'slate'}-400 font-bold mb-1`}>
                                    {isConsensusReached ? 'Valide' : 'En validation'}
                                </span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
                                <div className="bg-secondary-500 h-full rounded-full transition-all duration-500" style={{ width: `${consensusPercentage}%` }}></div>
                            </div>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                {isConsensusReached
                                    ? "Le consensus a été atteint. Le scrutin est désormais ouvert au vote."
                                    : "Les modérateurs doivent valider chaque session pour ouvrir le scrutin."}
                            </p>
                        </div>
                    </Card>

                    <Card className="bg-white border-slate-100 shadow-sm p-8">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center">
                            <ChartBarIcon className="w-4 h-4 mr-2" /> Statistiques Live
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Participation</span>
                                    <span className="text-xl font-black text-primary-600">
                                        {((election.voters?.length || 0) / (election.voterCount || 1) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100">
                                    <div
                                        className="bg-primary-500 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${((election.voters?.length || 0) / (election.voterCount || 1) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex flex-col gap-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Votes Scellés</span>
                                        <span className="font-bold text-slate-900">0</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Abstentions / Non voté</span>
                                        <span className="font-bold text-slate-900">{election.voters?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    )
}

export default AdminElectionDetail
