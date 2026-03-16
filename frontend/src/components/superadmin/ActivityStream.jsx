import React from 'react'
import {
    CubeIcon,
    UserCircleIcon,
    BoltIcon,
    CircleStackIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline'
import { useSettings } from '../../contexts/SettingsContext'

import { useElections } from '../../contexts/ElectionContext'
import { PlusCircleIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const ActivityStream = () => {
    const navigate = useNavigate()
    const { t } = useSettings()
    const { elections } = useElections()

    // Map elections to activity stream
    const activities = elections.slice(0, 5).map((e, idx) => ({
        id: e.address || idx,
        type: 'SESSION',
        org: 'EpiVote Global',
        detail: `Nouveau scrutin "${e.title}" déployé sur la blockchain`,
        time: idx === 0 ? "Récent" : `${idx + 2}h ago`,
        icon: GlobeAltIcon,
        color: 'text-primary-500',
        bg: 'bg-primary-50'
    }))

    // Add a default activity if empty
    if (activities.length === 0) {
        activities.push({
            id: 0,
            type: 'NETWORK',
            org: 'Mainnet',
            detail: 'Initialisation du réseau EpiVote réussie',
            time: 'En ligne',
            icon: CubeIcon,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50'
        })
    }

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
                                    <button
                                        onClick={() => toast.success('Logs: ' + activity.detail, { icon: '📊' })}
                                        className="text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors uppercase tracking-widest"
                                    >
                                        View Logs
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (activity.type === 'SESSION' && activity.id) {
                                                navigate(`/admin/elections/${activity.id}`)
                                            } else {
                                                toast('Détails du système indisponibles en démo', { icon: 'ℹ️' })
                                            }
                                        }}
                                        className="text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors uppercase tracking-widest"
                                    >
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
