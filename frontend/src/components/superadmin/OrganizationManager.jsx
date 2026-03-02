import React, { useState } from 'react'
import {
    BuildingOfficeIcon,
    PlusIcon,
    EllipsisHorizontalIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline'
import { useSettings } from '../../contexts/SettingsContext'
import Button from '../common/Button'
import Modal from '../common/Modal'

const OrganizationManager = () => {
    const { t } = useSettings()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const organizations = [
        { id: 1, name: 'Epitech Paris', location: 'Le Kremlin-Bicêtre', admins: 5, sessions: 12, status: 'Active' },
        { id: 2, name: 'Epitech Lyon', location: 'Lyon, France', admins: 3, sessions: 8, status: 'Active' },
        { id: 3, name: 'Epitech Marseille', location: 'Marseille, France', admins: 2, sessions: 5, status: 'Active' },
        { id: 4, name: 'Epitech Toulouse', location: 'Toulouse, France', admins: 2, sessions: 4, status: 'Pending' },
    ]

    const filteredOrgs = organizations.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                        {t({ fr: 'Gestion des Organisations', en: 'Organization Management' })}
                    </h1>
                    <p className="text-slate-500 text-lg">
                        {t({
                            fr: 'Ajoutez et configurez les entités qui utilisent VoteChain.',
                            en: 'Add and configure entities using VoteChain.'
                        })}
                    </p>
                </div>
                <Button
                    variant="primary"
                    icon={PlusIcon}
                    onClick={() => setIsModalOpen(true)}
                >
                    {t({ fr: 'Nouvelle Organisation', en: 'New Organization' })}
                </Button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="relative max-w-sm w-full">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t({ fr: 'Rechercher une organisation...', en: 'Search organization...' })}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Organisation</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Localisation</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Equipe</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Sessions</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Statut</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrgs.map((org) => (
                                <tr key={org.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center">
                                                <BuildingOfficeIcon className="h-5 w-5 text-primary-600" />
                                            </div>
                                            <span className="font-bold text-slate-900">{org.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                        <div className="flex items-center">
                                            <MapPinIcon className="h-4 w-4 mr-2 text-slate-400" />
                                            {org.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                        <div className="flex items-center">
                                            <UserGroupIcon className="h-4 w-4 mr-2 text-slate-400" />
                                            {org.admins} Admins
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{org.sessions}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${org.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {org.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all group-hover:shadow-sm">
                                            <EllipsisHorizontalIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={t({ fr: 'Nouvelle Organisation', en: 'New Organization' })}
            >
                <form className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Nom de l'organisation</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            placeholder="Ex: Epitech Digital"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Localisation</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="w-full">
                            Annuler
                        </Button>
                        <Button variant="primary" className="w-full">
                            Créer
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default OrganizationManager
