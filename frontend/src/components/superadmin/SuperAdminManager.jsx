import React, { useState } from 'react'
import {
    UserPlusIcon,
    ShieldCheckIcon,
    EnvelopeIcon,
    FingerPrintIcon,
    TrashIcon,
    KeyIcon
} from '@heroicons/react/24/outline'
import { useSettings } from '../../contexts/SettingsContext'
import { useElections } from '../../contexts/ElectionContext'
import Button from '../common/Button'
import Modal from '../common/Modal'
import toast from 'react-hot-toast'

const SuperAdminManager = () => {
    const { t } = useSettings()
    const { users, addUser } = useElections()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', email: '' })

    const superAdmins = users.filter(u => u.role === 'superadmin')

    const handleCreateSuper = async (e) => {
        e.preventDefault()
        const success = await addUser({
            ...formData,
            role: 'superadmin',
            password: Math.random().toString(36).slice(-8) // Random temp password
        })
        if (success) {
            setIsModalOpen(false)
            setFormData({ name: '', email: '' })
            // Note: The backend should handle sending the email with credentials
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                        {t({ fr: 'Gestion des Super Admins', en: 'Super Admin Management' })}
                    </h1>
                    <p className="text-slate-500 text-lg">
                        {t({
                            fr: 'Ajoutez d\'autres propriétaires pour gérer la plateforme.',
                            en: 'Add other owners to manage the platform.'
                        })}
                    </p>
                </div>
                <Button
                    variant="primary"
                    icon={UserPlusIcon}
                    onClick={() => setIsModalOpen(true)}
                >
                    {t({ fr: 'Ajouter un Super Admin', en: 'Add Super Admin' })}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {superAdmins.map((admin, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center">
                                <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-base font-black text-slate-900 truncate">{admin.name}</h4>
                                <p className="text-xs font-bold text-primary-600 uppercase tracking-widest">OWNER</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center text-sm font-medium text-slate-600">
                                <EnvelopeIcon className="h-4 w-4 mr-3 text-slate-400" />
                                {admin.email}
                            </div>
                            <div className="flex items-center text-sm font-medium text-slate-600">
                                <FingerPrintIcon className="h-4 w-4 mr-3 text-slate-400" />
                                ID: {admin.email.split('@')[0]}
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-50 flex space-x-3">
                            <Button variant="secondary" size="sm" icon={KeyIcon} className="flex-1 opacity-50 cursor-not-allowed">
                                Settings
                            </Button>
                            <Button variant="secondary" size="sm" icon={TrashIcon} className="flex-1 text-red-600 hover:bg-red-50">
                                Revoke
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={t({ fr: 'Nouveau Super Admin', en: 'New Super Admin' })}
            >
                <form onSubmit={handleCreateSuper} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Nom Complet</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Ex: John Doe"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Email Propriétaire</label>
                        <input
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="owner@votechain.com"
                        />
                    </div>
                    <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100">
                        <p className="text-xs font-bold text-primary-800 uppercase tracking-widest mb-1">Accès Critique</p>
                        <p className="text-xs text-primary-700 leading-relaxed">
                            Un nouvel administrateur système aura accès à toutes les fonctionnalités de la plateforme. Les identifiants seront envoyés par email.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="w-full">
                            Annuler
                        </Button>
                        <Button type="submit" variant="primary" className="w-full">
                            Créer le compte
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default SuperAdminManager
