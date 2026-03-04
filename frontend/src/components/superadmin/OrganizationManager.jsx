import React, { useState } from 'react'
import toast from 'react-hot-toast'
import {
    BuildingOfficeIcon,
    PlusIcon,
    EllipsisHorizontalIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline'
import { useSettings } from '../../contexts/SettingsContext'
import { useElections } from '../../contexts/ElectionContext'
import Button from '../common/Button'
import Modal from '../common/Modal'

const OrganizationManager = () => {
    const { t } = useSettings()
    const { elections, organizations, users, assignAdminToOrg, createOrganization, loading } = useElections()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
    const [selectedOrg, setSelectedOrg] = useState(null)
    const [selectedAdminEmail, setSelectedAdminEmail] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    const filteredOrgs = organizations.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const [orgFormData, setOrgFormData] = useState({ name: '', location: '' })

    const handleCreateOrg = async (e) => {
        e.preventDefault()
        const success = await createOrganization(orgFormData)
        if (success) {
            setIsModalOpen(false)
            setOrgFormData({ name: '', location: '' })
        }
    }

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

            {/* Organizations Table */}
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
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Scrutins</th>
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
                                            {org.admins?.length || 0} Admins
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-center">
                                        {elections.filter(e => e.type?.toLowerCase() === org.id?.toLowerCase()).length}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${org.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {org.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => { setSelectedOrg(org); setIsAdminModalOpen(true); }}
                                                className="text-xs font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest px-3 py-1.5 rounded-lg border border-primary-100 hover:bg-primary-50 transition-all">
                                                Assigner Admin
                                            </button>
                                        </div>
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
                <form onSubmit={handleCreateOrg} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Nom de l'organisation</label>
                        <input
                            required
                            type="text"
                            value={orgFormData.name}
                            onChange={(e) => setOrgFormData({ ...orgFormData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            placeholder="Ex: Epitech Digital"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Localisation</label>
                        <input
                            required
                            type="text"
                            value={orgFormData.location}
                            onChange={(e) => setOrgFormData({ ...orgFormData, location: e.target.value })}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            placeholder="Paris, France"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="w-full">
                            Annuler
                        </Button>
                        <Button variant="primary" type="submit" className="w-full">
                            Créer
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isAdminModalOpen}
                onClose={() => setIsAdminModalOpen(false)}
                title={`Assigner un Admin à ${selectedOrg?.name}`}
            >
                <form className="space-y-6" onSubmit={async (e) => {
                    e.preventDefault();
                    if (selectedAdminEmail && selectedOrg) {
                        const success = await assignAdminToOrg(selectedOrg.id, selectedAdminEmail)
                        if (success) setIsAdminModalOpen(false)
                    }
                }}>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Choisir l'Administrateur</label>
                        <select
                            required
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-slate-50"
                            value={selectedAdminEmail}
                            onChange={(e) => setSelectedAdminEmail(e.target.value)}
                        >
                            <option value="">Sélectionner un admin...</option>
                            {users.filter(u => u.role === 'admin').map(user => (
                                <option key={user.email} value={user.email}>{user.name} ({user.email})</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-slate-400 font-medium italic">Seuls les comptes avec le rôle "Administrateur" sont affichés.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <Button variant="secondary" onClick={() => setIsAdminModalOpen(false)} className="w-full">
                            Annuler
                        </Button>
                        <Button variant="primary" type="submit" className="w-full">
                            Confirmer l'accès
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default OrganizationManager
