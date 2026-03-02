import React from 'react'
import {
    CubeIcon,
    UserCircleIcon,
    BoltIcon,
    CircleStackIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline'
import { useSettings } from '../../contexts/SettingsContext'

const ActivityStream = () => {
    const { t } = useSettings()

    const activities = [
        { id: 1, type: 'VOTE', org: 'Epitech Lyon', detail: 'Nouveau vote enregistré sur le bloc #485,921', time: '1m ago', icon: BoltIcon, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 2, type: 'SESSION', org: 'Epitech Paris', detail: 'Session "BDE Selection" officiellement ouverte', time: '12m ago', icon: GlobeAltIcon, color: 'text-primary-500', bg: 'bg-primary-50' },
        { id: 3, type: 'ADMIN', org: 'System', detail: 'Nouvel admin Marie Curie ajouté à Epitech Lyon', time: '45m ago', icon: UserCircleIcon, color: 'text-purple-500', bg: 'bg-purple-50' },
        { id: 4, type: 'NETWORK', org: 'Mainnet', detail: 'Synchronisation du Smart Contract réussie', time: '1h ago', icon: CubeIcon, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 5, type: 'DATABASE', org: 'System', detail: 'Backup quotidien complété avec succès', time: '3h ago', icon: CircleStackIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                    {t({ fr: 'Flux d\'Activités', en: 'Activity Stream' })}
                </h1>
                <p className="text-slate-500 text-lg">
                    {t({
                        fr: 'Surveillance en temps réel de tous les événements de la plateforme.',
                        en: 'Real-time monitoring of all platform events.'
                    })}
                </p>
            </div>

            <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-100 hidden md:block"></div>

                <div className="space-y-8">
                    {activities.map((activity) => (
                        <div key={activity.id} className="relative flex items-start space-x-6">
                            <div className={`relative z-10 hidden md:flex h-16 w-16 rounded-3xl border-4 border-slate-50 items-center justify-center shrink-0 ${activity.bg}`}>
                                <activity.icon className={`h-8 w-8 ${activity.color}`} />
                            </div>

                            <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{activity.type}</span>
                                        <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                        <span className="text-sm font-bold text-primary-600">{activity.org}</span>
                                    </div>
                                    <span className="text-xs font-medium text-slate-400">{activity.time}</span>
                                </div>
                                <p className="text-slate-900 font-bold leading-relaxed">
                                    {activity.detail}
                                </p>
                                <div className="mt-4 flex items-center space-x-4">
                                    <button className="text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors uppercase tracking-widest">
                                        View Logs
                                    </button>
                                    <button className="text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors uppercase tracking-widest">
                                        Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-center pt-8">
                <button className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all transform active:scale-95 shadow-xl shadow-slate-200">
                    Load More History
                </button>
            </div>
        </div>
    )
}

export default ActivityStream
