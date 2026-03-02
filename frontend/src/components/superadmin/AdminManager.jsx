import React, { useState } from 'react'
import {
    UserPlusIcon,
    KeyIcon,
    EnvelopeIcon,
    BuildingOfficeIcon,
    ShieldCheckIcon,
    TrashIcon,
    FingerPrintIcon
} from '@heroicons/react/24/outline'
import { useSettings } from '../../contexts/SettingsContext'
import Button from '../common/Button'
import Modal from '../common/Modal'
import toast from 'react-hot-toast'

const AdminManager = () => {
    const { t } = useSettings()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedOrg, setSelectedOrg] = useState('')

    const admins = [
        { id: 1, name: 'Jean Dupont', email: 'jean.dupont@epitech.eu', org: 'Epitech Paris', role: 'Main Admin', lastLogin: 'Il y a 2h' },
        { id: 2, name: 'Marie Curie', email: 'marie.curie@epitech.eu', org: 'Epitech Lyon', role: 'Support Admin', lastLogin: 'Hier' },
        { id: 3, name: 'Thomas Pesquet', email: 'thomas@epitech.eu', org: 'Epitech Marseille', role: 'Main Admin', lastLogin: 'Actif' },
    ]

    const handleCreateAdmin = (e) => {
        e.preventDefault()
        toast.success('Administrateur créé ! Identifiants temporaires envoyés par mail.', {
            duration: 6000,
            icon: '✉️',
        })
        setIsModalOpen(false)
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                        {t({ fr: 'Gestion des Administrateurs', en: 'Administrator Management' })}
                    </h1>
                    <p className="text-slate-500 text-lg">
                        {t({
                            fr: 'Créez des accès pour les responsables d\'organisation.',
                            en: 'Create access for organization leads.'
                        })}
                    </p>
                </div>
                <Button
                    variant="primary"
                    icon={UserPlusIcon}
                    onClick={() => setIsModalOpen(true)}
                >
                    {t({ fr: 'Ajouter un Admin', en: 'Add Admin' })}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {admins.map((admin) => (
                    <div key={admin.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                                <FingerPrintIcon className="h-6 w-6 text-slate-400 group-hover:text-primary-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-base font-black text-slate-900 truncate">{admin.name}</h4>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{admin.role}</p>
                            </div>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center text-sm font-medium text-slate-600">
                                <EnvelopeIcon className="h-4 w-4 mr-3 text-slate-400" />
                                {admin.email}
                            </div>
                            <div className="flex items-center text-sm font-medium text-slate-600">
                                <BuildingOfficeIcon className="h-4 w-4 mr-3 text-slate-400" />
                                {admin.org}
                            </div>
                            <div className="flex items-center text-sm font-medium text-slate-600">
                                <ShieldCheckIcon className="h-4 w-4 mr-3 text-emerald-500" />
                                {t({ fr: 'Dernière connexion: ', en: 'Last login: ' })}{admin.lastLogin}
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-50 flex space-x-3">
                            <Button variant="secondary" size="sm" icon={KeyIcon} className="flex-1">
                                Pin Code
                            </Button>
                            <Button variant="secondary" size="sm" icon={EnvelopeIcon} className="flex-1">
                                Resend
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={t({ fr: 'Nouvel Administrateur', en: 'New Administrator' })}
            >
                <form onSubmit={handleCreateAdmin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Nom Complet</label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Ex: Paul Martin"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Email Académique / Pro</label>
                        <input
                            required
                            type="email"
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="admin@organisation.eu"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Organisation</label>
                        <select
                            required
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-slate-50"
                            value={selectedOrg}
                            onChange={(e) => setSelectedOrg(e.target.value)}
                        >
                            <option value="">Sélectionner une ville...</option>
                            <option value="paris">Epitech Paris</option>
                            <option value="lyon">Epitech Lyon</option>
                            <option value="marseille">Epitech Marseille</option>
                        </select>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Information</p>
                        <p className="text-xs text-amber-700 leading-relaxed">
                            Un email contenant un mot de passe temporaire et les instructions de première connexion sera envoyé automatiquement.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="w-full">
                            Annuler
                        </Button>
                        <Button type="submit" variant="primary" className="w-full">
                            Créer l'accès
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default AdminManager
