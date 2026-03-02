import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
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
    const { elections } = useElections()
    const { t } = useSettings()
    const navigate = useNavigate()

    const election = elections.find(e => e.id === id)
    const [expandedPart, setExpandedPart] = React.useState(null)

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

    // Mock consensus data since we don't have a real backend
    const consensusPercentage = 100 // Example: fully validated

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
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                            <TrophyIcon className="w-5 h-5 text-amber-500" />
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest ">Options de Vote (Parts)</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {election.candidates?.map((candidate, idx) => {
                                const isExpanded = expandedPart === candidate.id
                                const voteCount = election.votes?.[candidate.id] || 0
                                const totalVoters = election.voters?.length || 1
                                const percentage = ((voteCount / totalVoters) * 100).toFixed(1)

                                return (
                                    <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300">
                                        <div
                                            className="p-5 cursor-pointer hover:bg-slate-100/50 flex items-center gap-4"
                                            onClick={() => setExpandedPart(isExpanded ? null : candidate.id)}
                                        >
                                            <div className="h-12 w-12 bg-white rounded-xl border border-slate-200 shadow-sm flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                {candidate.photo || candidate.imageUrl ? (
                                                    <img src={candidate.photo || candidate.imageUrl} alt={candidate.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-lg font-black text-primary-200">{candidate.name.substring(0, 1)}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-slate-900 leading-tight">{candidate.name}</h4>
                                                <p className="text-[10px] text-slate-500 font-medium line-clamp-1">
                                                    {candidate.bio || candidate.description || "Détails non renseignés"}
                                                </p>
                                            </div>
                                            <div className="text-right px-4 border-l border-slate-200">
                                                <span className="text-lg font-black text-primary-600 block leading-none">{percentage}%</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{voteCount} v.</span>
                                            </div>
                                            <div className="text-slate-400">
                                                {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                                            </div>
                                        </div>
                                        {isExpanded && (
                                            <div className="p-6 bg-white border-t border-slate-100 animate-slide-down">
                                                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                                    {candidate.bio || candidate.description || "Aucun détail supplémentaire."}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </Card>
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
                                <span className="text-slate-400 font-bold mb-1">Valable</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
                                <div className="bg-secondary-500 h-full rounded-full" style={{ width: `${consensusPercentage}%` }}></div>
                            </div>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                Tous les modérateurs désignés ont cryptographiquement validé ces paramètres. Le scrutin est inaltérable.
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
