import React, { useState } from 'react'
import toast from 'react-hot-toast'
import {
    BuildingOfficeIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
    UserGroupIcon,
    UserPlusIcon,
    EnvelopeIcon,
    ArrowLeftIcon,
    ShieldCheckIcon,
    KeyIcon,
    CheckBadgeIcon,
    TrashIcon,
} from '@heroicons/react/24/outline'
import { useElections } from '../../contexts/ElectionContext'
import Button from '../common/Button'
import Modal from '../common/Modal'

// Generate a strong random password
const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let pw = ''
    for (let i = 0; i < 16; i++) pw += chars[Math.floor(Math.random() * chars.length)]
    return pw
}

// ─── Org List View ──────────────────────────────────────────────────
const OrgList = ({ organizations, elections, onSelect, onCreateOrg }) => {
    const [search, setSearch] = useState('')
    const filtered = organizations.filter(o => o.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Organisations & Administrateurs</h1>
                    <p className="text-slate-500 text-lg">Gérez les entités et leurs accès administrateurs depuis un seul endroit.</p>
                </div>
                <Button variant="primary" icon={PlusIcon} onClick={onCreateOrg}>
                    Nouvelle Organisation
                </Button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-sm w-full">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une organisation..."
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Organisation</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Localisation</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Admins</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Scrutins</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Statut</th>
                                <th className="px-6 py-4" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-medium">
                                        Aucune organisation trouvée
                                    </td>
                                </tr>
                            ) : filtered.map(org => (
                                <tr
                                    key={org.id}
                                    onClick={() => onSelect(org)}
                                    className="hover:bg-primary-50/40 transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                                                <BuildingOfficeIcon className="h-5 w-5 text-primary-600" />
                                            </div>
                                            <span className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors">{org.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <MapPinIcon className="h-4 w-4 text-slate-400" />
                                            {org.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <UserGroupIcon className="h-4 w-4 text-slate-400" />
                                            <span className={org.admins?.length ? 'text-emerald-600 font-black' : 'text-slate-400'}>
                                                {org.admins?.length || 0} admin{org.admins?.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-center">
                                        {elections.filter(e => e.type?.toLowerCase() === org.id?.toLowerCase()).length}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${org.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {org.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-xs font-black text-primary-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                            Gérer →
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

// ─── Org Detail View ─────────────────────────────────────────────────
const OrgDetail = ({ org, elections, users, onBack }) => {
    const [addAdminOpen, setAddAdminOpen] = useState(false)
    const [adminEmail, setAdminEmail] = useState('')
    const [adminName, setAdminName] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Admins currently linked to this org
    const orgAdmins = users.filter(u => u.org === org.id || org.admins?.includes(u.email))
    const orgElections = elections.filter(e => e.type?.toLowerCase() === org.id?.toLowerCase())

    const handleAddAdmin = async (e) => {
        e.preventDefault()
        if (!adminEmail) return
        setIsSubmitting(true)
        const password = generatePassword()
        try {
            const res = await fetch('http://localhost:3001/api/auth/add-admin-to-org', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: adminEmail,
                    name: adminName || adminEmail.split('@')[0],
                    orgId: org.id,
                    orgName: org.name,
                    password
                })
            })
            const result = await res.json()
            if (result.success) {
                toast.success(`Compte admin créé ! Identifiants envoyés à ${adminEmail}.`, { icon: '✉️', duration: 5000 })
                setAddAdminOpen(false)
                setAdminEmail('')
                setAdminName('')
            } else {
                toast.error(result.error || 'Erreur lors de la création')
            }
        } catch (err) {
            toast.error('Erreur serveur')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Back + Header */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
                    <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
                </button>
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-[20px] bg-primary-100 flex items-center justify-center">
                        <BuildingOfficeIcon className="h-7 w-7 text-primary-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{org.name}</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                                <MapPinIcon className="h-4 w-4 text-slate-400" />{org.location}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${org.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {org.status || 'Active'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Administrateurs', value: orgAdmins.length, icon: UserGroupIcon, color: 'text-primary-600 bg-primary-50' },
                    { label: 'Scrutins', value: orgElections.length, icon: CheckBadgeIcon, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Statut', value: org.status || 'Active', icon: ShieldCheckIcon, color: 'text-amber-600 bg-amber-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${stat.color.split(' ')[1]}`}>
                            <stat.icon className={`h-6 w-6 ${stat.color.split(' ')[0]}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Admins Section */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Liste des Modérateurs</h2>
                        <p className="text-sm font-bold text-slate-700">Comptes administrateurs de {org.name}</p>
                    </div>
                    <button
                        onClick={() => setAddAdminOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-colors shadow-lg"
                    >
                        <UserPlusIcon className="h-4 w-4" />
                        Ajouter un Admin
                    </button>
                </div>

                {orgAdmins.length === 0 ? (
                    <div className="py-16 flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center">
                            <UserGroupIcon className="h-8 w-8 text-slate-300" />
                        </div>
                        <div>
                            <p className="text-slate-500 font-bold">Aucun administrateur assigné</p>
                            <p className="text-slate-400 text-sm mt-1">Cliquez sur "Ajouter un Admin" pour commencer.</p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {orgAdmins.map((admin, idx) => (
                            <div key={idx} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors group">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-sm shrink-0">
                                    {(admin.name || admin.email)[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-slate-900 truncate">{admin.name || '—'}</p>
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <EnvelopeIcon className="h-3.5 w-3.5 shrink-0" />
                                        <span className="text-xs font-medium truncate">{admin.email}</span>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-primary-100">
                                    Admin
                                </span>
                                <button className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 shrink-0">
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Admin Modal */}
            <Modal
                isOpen={addAdminOpen}
                onClose={() => setAddAdminOpen(false)}
                title={`Ajouter un Admin à ${org.name}`}
            >
                <form onSubmit={handleAddAdmin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Nom Complet</label>
                        <input
                            type="text"
                            placeholder="Ex: Paul Martin"
                            value={adminName}
                            onChange={e => setAdminName(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Email *</label>
                        <input
                            required
                            type="email"
                            placeholder="admin@organisation.eu"
                            value={adminEmail}
                            onChange={e => setAdminEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                        <KeyIcon className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-1">Accès automatique</p>
                            <p className="text-xs text-emerald-700 leading-relaxed">
                                Un compte sera créé ou mis à jour avec un mot de passe fort généré automatiquement. Les identifiants seront envoyés par email à l'adresse saisie.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setAddAdminOpen(false)} className="w-full">
                            Annuler
                        </Button>
                        <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Envoi...' : 'Créer & Notifier'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

// ─── Root Component ──────────────────────────────────────────────────
const OrganizationManager = () => {
    const { elections, organizations, users, createOrganization } = useElections()
    const [selectedOrg, setSelectedOrg] = useState(null)
    const [createOrgOpen, setCreateOrgOpen] = useState(false)
    const [orgForm, setOrgForm] = useState({ name: '', location: '' })

    const handleCreateOrg = async (e) => {
        e.preventDefault()
        const success = await createOrganization(orgForm)
        if (success) {
            setCreateOrgOpen(false)
            setOrgForm({ name: '', location: '' })
        }
    }

    if (selectedOrg) {
        return (
            <OrgDetail
                org={selectedOrg}
                elections={elections}
                users={users}
                onBack={() => setSelectedOrg(null)}
            />
        )
    }

    return (
        <>
            <OrgList
                organizations={organizations}
                elections={elections}
                onSelect={setSelectedOrg}
                onCreateOrg={() => setCreateOrgOpen(true)}
            />

            <Modal
                isOpen={createOrgOpen}
                onClose={() => setCreateOrgOpen(false)}
                title="Nouvelle Organisation"
            >
                <form onSubmit={handleCreateOrg} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Nom de l'organisation</label>
                        <input
                            required
                            type="text"
                            value={orgForm.name}
                            onChange={e => setOrgForm({ ...orgForm, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Ex: Epitech Digital"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Localisation</label>
                        <input
                            required
                            type="text"
                            value={orgForm.location}
                            onChange={e => setOrgForm({ ...orgForm, location: e.target.value })}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Paris, France"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <Button variant="secondary" onClick={() => setCreateOrgOpen(false)} className="w-full">Annuler</Button>
                        <Button variant="primary" type="submit" className="w-full">Créer</Button>
                    </div>
                </form>
            </Modal>
        </>
    )
}

export default OrganizationManager
