import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useSettings } from '../contexts/SettingsContext'
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../api';
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import { EnvelopeIcon, ChatBubbleBottomCenterTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const RequestVotePage = () => {
    const { t } = useSettings()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [description, setDescription] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/api/request-vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, description })
            });
            const result = await res.json();
            if (result.success) {
                setSubmitted(true)
                toast.success(t({ fr: 'Demande envoyée !', en: 'Request sent!' }))
            } else {
                toast.error(result.error || 'Erreur lors de l\'envoi')
            }
        } catch (error) {
            console.error('Submit error:', error)
            toast.error('Erreur de connexion au serveur')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-4 bg-slate-50 flex items-center justify-center transition-colors duration-300">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center"
                >
                    <div className="h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircleIcon className="h-12 w-12 text-primary-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">
                        {t({ fr: 'Demande Reçue', en: 'Request Received' })}
                    </h2>
                    <p className="text-slate-500 font-medium mb-10 leading-relaxed text-lg">
                        {t({
                            fr: 'Votre demande de création de vote a été transmise au Super Admin. Vous recevrez un email dès qu\'elle sera traitée.',
                            en: 'Your vote creation request has been forwarded to the Super Admin. You will receive an email once it is processed.'
                        })}
                    </p>
                    <Button onClick={() => navigate('/')} className="w-full h-14 rounded-2xl">
                        {t({ fr: 'Retour à l\'accueil', en: 'Back to Home' })}
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 bg-slate-50 transition-colors duration-300">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter">
                        {t({ fr: 'Lancer un scrutin', en: 'Start a Ballot' })}
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">
                        {t({
                            fr: 'Soumettez votre proposition de vote aux administrateurs de la plateforme.',
                            en: 'Submit your voting proposal to the platform administrators.'
                        })}
                    </p>
                </div>

                <Card className="p-8 md:p-12">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">
                                {t({ fr: 'Votre Email Institutionnel', en: 'Your Institutional Email' })}
                            </label>
                            <div className="relative">
                                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@epitech.eu"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">
                                {t({ fr: 'Sujet & Description du Vote', en: 'Vote Subject & Description' })}
                            </label>
                            <div className="relative">
                                <ChatBubbleBottomCenterTextIcon className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                                <textarea
                                    required
                                    rows={6}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={t({
                                        fr: 'Décrivez brièvement le but du vote, les participants concernés et les options proposées...',
                                        en: 'Briefly describe the purpose of the vote, the participants involved, and the proposed options...'
                                    })}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all font-medium resize-none"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            loading={loading}
                            disabled={!email || !description}
                            className="w-full h-16 rounded-2xl text-lg shadow-xl shadow-primary-500/10"
                        >
                            {t({ fr: 'Envoyer la demande', en: 'Send Request' })}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    )
}

export default RequestVotePage
