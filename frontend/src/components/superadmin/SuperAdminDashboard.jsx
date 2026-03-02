import React from 'react'
import {
    BuildingOfficeIcon,
    UserGroupIcon,
    InboxStackIcon,
    CheckBadgeIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { useSettings } from '../../contexts/SettingsContext'

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50">
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            {trend && (
                <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                    {trend}
                </span>
            )}
        </div>
        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-3xl font-black text-slate-900">{value}</p>
    </div>
)

const SuperAdminDashboard = () => {
    const { t } = useSettings()

    const stats = [
        { title: t({ fr: 'Organisations', en: 'Organizations' }), value: '12', icon: BuildingOfficeIcon, color: 'bg-blue-500', trend: '+2' },
        { title: t({ fr: 'Administrateurs', en: 'Administrators' }), value: '24', icon: UserGroupIcon, color: 'bg-purple-500', trend: '+4' },
        { title: t({ fr: 'Sessions Actives', en: 'Active Sessions' }), value: '8', icon: InboxStackIcon, color: 'bg-indigo-500', trend: 'Live' },
        { title: t({ fr: 'Votes Totaux', en: 'Total Votes' }), value: '15.4k', icon: CheckBadgeIcon, color: 'bg-emerald-500', trend: '+12%' },
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                    {t({ fr: 'Propriétaire VoteChain', en: 'VoteChain Owner' })}
                </h1>
                <p className="text-slate-500 text-lg">
                    {t({
                        fr: 'Aperçu global de toutes les activités et métriques du système.',
                        en: 'Global overview of all activities and system metrics.'
                    })}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-6">
                        {t({ fr: 'Activités Récentes', en: 'Recent Activities' })}
                    </h3>
                    <div className="space-y-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                                    EP
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900">Nouvelle session créée par Epitech Paris</p>
                                    <p className="text-xs text-slate-500">Il y a 15 minutes • BDE Election 2024</p>
                                </div>
                                <div className="text-xs font-bold text-slate-400">
                                    MAR 02
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-primary-600 rounded-3xl p-8 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -m-8 h-48 w-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                    <h3 className="text-xl font-black mb-4 relative z-10">System Status</h3>
                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                            <span className="text-primary-100 text-sm font-medium">Blockchain Network</span>
                            <span className="flex items-center text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">Operational</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                            <span className="text-primary-100 text-sm font-medium">Smart Contracts</span>
                            <span className="flex items-center text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">Operational</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-primary-100 text-sm font-medium">API Gateway</span>
                            <span className="flex items-center text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">Operational</span>
                        </div>
                    </div>
                    <button className="w-full mt-8 py-4 bg-white text-primary-600 font-black rounded-2xl hover:bg-primary-50 transition-all duration-300 transform active:scale-95 shadow-xl shadow-primary-900/20">
                        System Monitoring
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SuperAdminDashboard
