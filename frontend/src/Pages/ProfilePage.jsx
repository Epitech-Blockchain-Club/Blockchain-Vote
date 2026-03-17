import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import {
    UserCircleIcon,
    CameraIcon,
    ShieldCheckIcon,
    BuildingOfficeIcon,
    GlobeAltIcon,
    KeyIcon,
    SparklesIcon,
    IdentificationIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const ROLE_META = {
    superadmin: { label: 'Super Admin', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    admin:      { label: 'Administrateur', color: 'bg-primary-50 text-primary-700 border-primary-200' },
    moderator:  { label: 'Modérateur', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    voter:      { label: 'Électeur', color: 'bg-slate-100 text-slate-600 border-slate-200' },
}

const inputCls = 'w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all font-medium'
const readonlyCls = 'w-full px-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400 font-medium cursor-not-allowed'

const ProfilePage = () => {
    const { user, updateUser } = useAuth()
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({ name: '', email: '', bio: '' })
    const [avatarPreview, setAvatarPreview] = useState(null)

    const role = user?.role || 'voter'
    const isAdmin = role === 'admin' || role === 'superadmin'
    const isSuperAdmin = role === 'superadmin'
    const isLite = role === 'voter' || role === 'moderator'
    const roleMeta = ROLE_META[role] || ROLE_META.voter

    // Sync form when user loads or changes
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || '',
            })
            setAvatarPreview(user.avatar || null)
        }
    }, [user?.email, user?.name, user?.bio, user?.avatar])

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image trop volumineuse (max 2 Mo)')
            e.target.value = ''
            return
        }
        const reader = new FileReader()
        reader.onloadend = () => setAvatarPreview(reader.result)
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const payload = { name: formData.name, avatar: avatarPreview }
            if (isAdmin) payload.bio = formData.bio

            const updated = await updateUser(payload)
            // Sync form with persisted values
            if (updated) {
                setFormData(prev => ({
                    ...prev,
                    name: updated.name || prev.name,
                    bio: updated.bio || prev.bio,
                }))
                setAvatarPreview(updated.avatar || avatarPreview)
            }
            toast.success('Profil mis à jour')
        } catch (err) {
            toast.error(err.message || 'Erreur lors de la mise à jour')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 px-4">
            <div className="max-w-4xl mx-auto py-10">
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Mon Profil</h1>
                    <p className="text-slate-500 font-medium">Gérez vos informations personnelles</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ── Left Card ── */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card className="bg-white border-slate-100 shadow-sm p-8 text-center">
                            {/* Avatar */}
                            <div className="relative inline-block mb-5 group">
                                <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 mx-auto">
                                    {avatarPreview
                                        ? <img src={avatarPreview} alt="Profil" className="h-full w-full object-cover" />
                                        : <UserCircleIcon className="h-full w-full text-slate-300" />
                                    }
                                </div>
                                <label className="absolute bottom-0 right-0 h-9 w-9 bg-primary-600 rounded-full border-4 border-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-700 transition-colors group-hover:scale-110">
                                    <CameraIcon className="h-4 w-4 text-white" />
                                    <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                                </label>
                            </div>

                            {/* Name + email */}
                            <p className="text-lg font-black text-slate-900 leading-tight">
                                {user?.name || user?.email?.split('@')[0] || '—'}
                            </p>
                            <p className="text-xs text-slate-400 font-medium mb-3 truncate">{user?.email}</p>

                            {/* Role badge */}
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border inline-block ${roleMeta.color}`}>
                                {roleMeta.label}
                            </span>

                            {/* Contextual infos */}
                            <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3">
                                {isAdmin && (
                                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                        <ShieldCheckIcon className="w-4 h-4 text-primary-500 shrink-0" />
                                        <span>Compte administrateur vérifié</span>
                                    </div>
                                )}
                                {isSuperAdmin && (
                                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                        <SparklesIcon className="w-4 h-4 text-purple-500 shrink-0" />
                                        <span>Accès système complet</span>
                                    </div>
                                )}
                                {user?.org && (
                                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                        <BuildingOfficeIcon className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span className="truncate">{user.org}</span>
                                    </div>
                                )}
                                {isLite && user?.provider && (
                                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                        <GlobeAltIcon className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span>Connecté via {user.provider === 'google' ? 'Google' : user.provider === 'microsoft' ? 'Microsoft' : user.provider}</span>
                                    </div>
                                )}
                                {isLite && (
                                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                        <IdentificationIcon className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span>Identité vérifiée par OAuth</span>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* SuperAdmin extra card */}
                        {isSuperAdmin && (
                            <Card className="bg-purple-50 border-purple-100 shadow-sm p-5">
                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Accès Super Admin</p>
                                <p className="text-xs text-purple-700 font-medium leading-relaxed">
                                    Vous gérez l'ensemble des organisations, utilisateurs et paramètres système de la plateforme.
                                </p>
                            </Card>
                        )}
                    </div>

                    {/* ── Right Form ── */}
                    <div className="lg:col-span-2">
                        <Card className="bg-white border-slate-100 shadow-sm p-8">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-4 border-b border-slate-100">
                                    Informations personnelles
                                </h2>

                                {/* Nom */}
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nom affiché</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                        className={inputCls}
                                        placeholder="Votre nom"
                                    />
                                </div>

                                {/* Email readonly */}
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email</label>
                                    <input type="email" readOnly value={formData.email} className={readonlyCls} />
                                    <p className="text-[10px] text-slate-400 font-medium mt-1.5 px-1">L'email ne peut pas être modifié.</p>
                                </div>

                                {/* Bio — admins only */}
                                {isAdmin && (
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Bio / Présentation</label>
                                        <textarea
                                            rows="4"
                                            value={formData.bio}
                                            onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                                            className={inputCls}
                                            placeholder="Décrivez votre rôle..."
                                        />
                                    </div>
                                )}

                                {/* Voter/Moderator info block */}
                                {isLite && (
                                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Informations de connexion</p>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Fournisseur</p>
                                                <p className="font-black text-slate-700 capitalize">{user?.provider || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Rôle</p>
                                                <p className="font-black text-slate-700 capitalize">{roleMeta.label}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* SuperAdmin org field (readonly) */}
                                {isSuperAdmin && user?.org && (
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Organisation</label>
                                        <input type="text" readOnly value={user.org} className={readonlyCls} />
                                    </div>
                                )}

                                <div className="pt-2">
                                    <Button type="submit" loading={saving} size="lg" className="w-full sm:w-auto h-12 px-10 rounded-2xl shadow-lg shadow-primary-500/20">
                                        Enregistrer
                                    </Button>
                                </div>
                            </form>
                        </Card>

                        {/* Admin — security card */}
                        {isAdmin && (
                            <Card className="bg-white border-slate-100 shadow-sm p-6 mt-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                        <KeyIcon className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-slate-900">Sécurité du compte</p>
                                        <p className="text-xs text-slate-400 font-medium">Le mot de passe se gère depuis l'email d'invitation ou via votre administrateur.</p>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
