import React, { useState, useEffect } from 'react'
import {
    BuildingOfficeIcon,
    UserGroupIcon,
    InboxStackIcon,
    CheckBadgeIcon,
    ArrowTrendingUpIcon,
    BellIcon,
    ClockIcon
} from '@heroicons/react/24/outline'
import { useSettings } from '../../contexts/SettingsContext'
import { useElections } from '../../contexts/ElectionContext'

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50">
        <div className="flex items-start justify-between mb-4">
            <div className={`p-2.5 sm:p-3 rounded-2xl ${color}`}>
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            {trend && (
                <span className="flex items-center text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                    {trend}
                </span>
            )}
        </div>
        <h3 className="text-slate-500 text-[10px] sm:text-sm font-bold uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-2xl sm:text-3xl font-black text-slate-900">{value}</p>
    </div>
)

const SuperAdminDashboard = () => {
    const { t } = useSettings()
    const { elections, loading } = useElections()
    const [notifications, setNotifications] = useState([])
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

    useEffect(() => {
        const fetchNotifs = async () => {
            try {
                const res = await fetch(`${API_BASE}/superadmin/notifications`)
                const result = await res.json()
                if (result.success) setNotifications(result.data || [])
            } catch (err) { /* silently fail */ }
        }
        fetchNotifs()
        const interval = setInterval(fetchNotifs, 15000)
        return () => clearInterval(interval)
    }, [])

    const activeSessions = elections.filter(e => {
        const now = new Date()
        return now >= new Date(e.startDate) && now <= new Date(e.endDate)
    }).length

    const totalVotes = elections.reduce((acc, curr) => {
        const sessionVotes = Object.values(curr.votes || {}).reduce((a, b) => a + b, 0)
        return acc + sessionVotes
    }, 0)

    const stats = [
        { title: t({ fr: 'Organisations', en: 'Organizations' }), value: '1', icon: BuildingOfficeIcon, color: 'bg-blue-500', trend: 'Live' },
        { title: t({ fr: 'Administrateurs', en: 'Administrators' }), value: '2', icon: UserGroupIcon, color: 'bg-purple-500', trend: 'Live' },
        { title: t({ fr: 'Sessions Actives', en: 'Active Sessions' }), value: activeSessions.toString(), icon: InboxStackIcon, color: 'bg-indigo-500', trend: 'Live' },
        { title: t({ fr: 'Votes Totaux', en: 'Total Votes' }), value: totalVotes > 1000 ? (totalVotes / 1000).toFixed(1) + 'k' : totalVotes.toString(), icon: CheckBadgeIcon, color: 'bg-emerald-500', trend: totalVotes > 0 ? '+100%' : '0' },
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
                    {t({ fr: 'Propriétaire VoteChain', en: 'VoteChain Owner' })}
                </h1>
                <p className="text-slate-500 text-sm sm:text-lg">
                    {t({
                        fr: 'Aperçu global de toutes les activités et métriques du système.',
                        en: 'Global overview of all activities and system metrics.'
                    })}
                </p>
            </div>

            {/* Stats — 2 cols on mobile, 4 on lg */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Main content: Activity + System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <ClockIcon className="h-5 w-5 text-primary-600" />
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                            {t({ fr: 'Flux d\'Activités', en: 'Activity Feed' })}
                        </h3>
                        {loading && (
                            <span className="ml-auto text-[10px] font-bold text-slate-400 animate-pulse uppercase tracking-widest">Mise à jour...</span>
                        )}
                    </div>

                    {/* Pending org requests */}
                    {notifications.length > 0 && (
                        <div className="mb-6">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3">
                                🔔 Demandes en attente
                            </p>
                            <div className="space-y-2">
                                {notifications.map((n, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-2xl">
                                        <BellIcon className="h-5 w-5 text-amber-500 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">{n.message || 'Nouvelle demande de création d\'organisation'}</p>
                                            <p className="text-xs text-slate-500">{n.email || ''} · {new Date(n.timestamp || Date.now()).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Elections activity */}
                    <div className="space-y-2">
                        {elections.length === 0 && !loading ? (
                            <p className="text-slate-400 italic text-sm py-8 text-center">Aucune activité récente.</p>
                        ) : elections.slice(0, 6).map((election) => (
                            <div key={election.id} className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors shrink-0 text-sm">
                                    {election.title.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">Scrutin : {election.title}</p>
                                    <p className="text-xs text-slate-500 truncate">{new Date(election.startDate).toLocaleDateString()} · {election.type}</p>
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase shrink-0 hidden sm:block">
                                    {new Date(election.startDate).toLocaleString('default', { month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-primary-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -m-8 h-48 w-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                    <h3 className="text-lg sm:text-xl font-black mb-4 relative z-10">System Status</h3>
                    <div className="space-y-3 relative z-10">
                        {[
                            { label: 'Blockchain Network', status: 'Operational' },
                            { label: 'Smart Contracts', status: 'Operational' },
                            { label: 'API Gateway', status: 'Operational' },
                            { label: 'Email Service', status: 'Operational' },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
                                <span className="text-primary-100 text-sm font-medium">{item.label}</span>
                                <span className="flex items-center text-[10px] font-bold bg-white/20 px-2 py-1 rounded-lg">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-3.5 bg-white text-primary-600 font-black rounded-2xl hover:bg-primary-50 transition-all duration-300 active:scale-95 shadow-xl shadow-primary-900/20 text-sm">
                        System Monitoring
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SuperAdminDashboard
