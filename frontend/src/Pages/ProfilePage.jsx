import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import {
    UserCircleIcon,
    CameraIcon,
    KeyIcon,
    BellIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const ProfilePage = () => {
    const { user, updateUser } = useAuth()
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || 'Administrateur de la plateforme Blockchain-Vote.'
    })
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null)

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result)
                toast.success('Aperçu de la photo de profil mis à jour')
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await updateUser({
                name: formData.name,
                bio: formData.bio,
                avatar: avatarPreview
            })
            toast.success('Profil mis à jour avec succès')
        } catch (err) {
            toast.error(err.message || 'Erreur lors de la mise à jour')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Mon Profil</h1>
                    <p className="text-slate-500 font-medium">Gérez vos informations personnelles et préférences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Avatar Section */}
                    <div className="lg:col-span-1">
                        <Card className="bg-white border-slate-100 shadow-sm p-8 text-center">
                            <div className="relative inline-block mb-6 group">
                                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 mx-auto">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <UserCircleIcon className="h-full w-full text-slate-300" />
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 h-10 w-10 bg-primary-600 rounded-full border-4 border-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-700 transition-colors group-hover:scale-110">
                                    <CameraIcon className="h-5 w-5 text-white" />
                                    <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                                </label>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-1">{user?.email}</h3>
                            <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-lg inline-block">Administrateur</p>

                            <div className="mt-8 pt-8 border-t border-slate-50 text-left space-y-4">
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                    <ShieldCheckIcon className="w-5 h-5 text-primary-500" />
                                    <span>Compte Vérifié</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                    <BellIcon className="w-5 h-5 text-primary-500" />
                                    <span>Notifications Actives</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <Card className="bg-white border-slate-100 shadow-sm p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nom Complet</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all font-medium"
                                        placeholder="Votre nom"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email Institutionnel</label>
                                    <input
                                        type="email"
                                        readOnly
                                        value={formData.email}
                                        className="w-full px-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 font-medium cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Bio / Présentation</label>
                                    <textarea
                                        rows="4"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all font-medium"
                                        placeholder="Parlez-nous de vous..."
                                    ></textarea>
                                </div>

                                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                                    <Button type="submit" size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-10 rounded-2xl shadow-lg shadow-primary-500/20 text-sm sm:text-base whitespace-nowrap">
                                        Enregistrer les modifications
                                    </Button>
                                    <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 rounded-2xl border-slate-200 text-sm sm:text-base whitespace-nowrap">
                                        <KeyIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                        Changer le mot de passe
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
