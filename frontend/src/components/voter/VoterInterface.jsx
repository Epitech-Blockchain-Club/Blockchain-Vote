import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
    CheckBadgeIcon,
    InformationCircleIcon,
    ArrowPathIcon,
    UserGroupIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon as ShieldCheckIconSolid } from '@heroicons/react/24/solid';
import Button from '../common/Button';
import { API_BASE_URL, API_ROUTES } from '../../config/api';

const API_URL = `${API_BASE_URL}/api`;

const VoterInterface = ({ election, authorizedSessions, user }) => {
    const navigate = useNavigate();
    const [selections, setSelections] = useState({}); // { [sessionAddress]: optionIndex }
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVoted, setIsVoted] = useState(false);

    if (!election || election === 'unauthorized') {
        return <div className="py-20 text-center font-black animate-pulse text-slate-400">Initialisation de l'interface de vote...</div>;
    }

    const totalSessions = authorizedSessions.length;
    const completedSessions = Object.keys(selections).length;
    const progress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    const handleVoteSubmit = async () => {
        if (completedSessions < totalSessions) {
            toast.error(`Veuillez voter pour les ${totalSessions} sessions disponibles.`);
            return;
        }

        setIsSubmitting(true);
        try {
            // election.id is the scrutin address (set in ElectionContext: id: scrutin.address)
            const scrutinAddr = election.id || election.address;
            const res = await fetch(`${API_URL}/scrutins/${scrutinAddr}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    selections: selections // { sessionAddress: optionIndex }
                })
            });

            const result = await res.json();
            if (result.success) {
                setIsVoted(true);
                toast.success("Votre vote global a été scellé sur la Blockchain.");
                setTimeout(() => navigate('/'), 5000);
            } else {
                throw new Error(result.error || "Échec de la soumission.");
            }
        } catch (error) {
            toast.error(error.message || "Un seul vote par électeur est permis.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetSelections = () => {
        setSelections({});
        toast.success("Vos choix ont été réinitialisés.");
    };

    if (isVoted) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-emerald-100 rounded-[32px] flex items-center justify-center mb-8 border border-emerald-200"
                >
                    <CheckBadgeIcon className="h-12 w-12 text-emerald-600" />
                </motion.div>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-black text-slate-900 mb-4 tracking-tight"
                >
                    Vote Enregistré !
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-slate-500 font-medium max-w-md mb-10 leading-relaxed"
                >
                    Merci pour votre participation. Votre vote a été anonymisé et scellé sur la blockchain publique.
                </motion.p>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-10 w-full max-w-sm"
                >
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Preuve d'Intégrité Blockchain</p>
                    <div className="flex items-center justify-center gap-2 text-emerald-600 font-black text-xs uppercase mb-3 text-center">
                        <ShieldCheckIconSolid className="w-4 h-4" />
                        Scellé et Immuable
                    </div>
                    <p className="text-xs font-mono text-slate-600 break-all select-all bg-white p-3 rounded-xl border border-slate-200 mb-4">
                        {Math.random().toString(36).substring(2, 15)}...{(election.id || election.address || '').substring(0, 10)}
                    </p>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                        Déconnexion automatique dans 5 secondes...
                    </div>
                </motion.div>
                <Button onClick={() => navigate('/')} variant="outline" className="px-10 h-14 rounded-2xl">
                    Retour à l'accueil
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-40">
            {/* Header / Progression Bar */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm px-6 py-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <span className="p-2 bg-primary-100 rounded-xl">
                                <ShieldCheckIconSolid className="w-6 h-6 text-primary-600" />
                            </span>
                            {election.title}
                        </h1>
                        <p className="text-slate-400 text-xs font-bold mt-1">
                            Électeur : <span className="text-primary-500">{user.email}</span> — Veuillez sélectionner une option pour chaque session.
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 w-full md:w-64">
                        <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">Progression</span>
                            <span className="text-primary-600">{completedSessions} / {totalSessions}</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-primary-600 rounded-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16">
                {authorizedSessions.map((session, sIdx) => (
                    <section key={session.address || sIdx} className="space-y-6 sm:space-y-8 animate-slide-up">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs sm:text-base">
                                    {sIdx + 1}
                                </span>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">{session.title}</h2>
                                    <p className="text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">SÉCURISÉ PAR SMART CONTRACT</p>
                                </div>
                            </div>
                            {selections[session.address] !== undefined ? (
                                <span className="self-start sm:self-auto text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-emerald-100">
                                    ✓ Sélectionné
                                </span>
                            ) : (
                                <span className="self-start sm:self-auto text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-pulse" />
                                    En attente
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                            {(session.options || []).map((option, oIdx) => (
                                <div
                                    key={oIdx}
                                    onClick={() => setSelections({ ...selections, [session.address]: oIdx })}
                                    className={`relative bg-white rounded-3xl sm:rounded-[32px] border-2 transition-all p-3 sm:p-6 flex flex-col h-full cursor-pointer group
                                        ${selections[session.address] === oIdx
                                            ? 'border-primary-600 bg-primary-50/30 shadow-lg shadow-primary-100'
                                            : 'border-slate-100 hover:border-slate-200 hover:shadow-xl'
                                        }`}
                                >
                                    {option.imageUrl && (
                                        <div className="aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 mb-3 sm:mb-4">
                                            <img src={option.imageUrl} alt={option.title} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <h3 className={`text-sm sm:text-lg font-black mb-1 leading-tight ${selections[session.address] === oIdx ? 'text-primary-700' : 'text-slate-900'}`}>
                                        {option.title}
                                    </h3>

                                    {/* Hover Details Overlay */}
                                    <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-md rounded-3xl sm:rounded-[32px] p-4 sm:p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col pointer-events-none overflow-y-auto">
                                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                            <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
                                                <UserGroupIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
                                            </div>
                                            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Détails de la liste</span>
                                        </div>

                                        {option.description ? (
                                            <p className="text-[10px] sm:text-xs text-slate-600 font-medium leading-relaxed mb-4 sm:mb-6 italic border-l-2 border-primary-200 pl-2 sm:pl-3">
                                                "{option.description}"
                                            </p>
                                        ) : (
                                            <p className="text-[10px] sm:text-xs text-slate-400 font-medium mb-4 sm:mb-6 italic">Aucune description disponible.</p>
                                        )}

                                        {option.members && option.members.length > 0 && (
                                            <div className="mt-auto">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Membres de la liste</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {option.members.map((member, mi) => (
                                                        <div key={mi} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1.5 min-w-0">
                                                            <div className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                                {member.photoUrl ? (
                                                                    <img src={member.photoUrl} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <UserCircleIcon className="w-3.5 h-3.5 text-slate-400" />
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-700 truncate">{member.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {option.description && (
                                        <p className="text-xs text-slate-400 font-medium mb-2 line-clamp-2">{option.description}</p>
                                    )}
                                    <div className="mt-auto pt-4">
                                        <div className={`w-full py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-center transition-all
                                            ${selections[session.address] === oIdx
                                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-400/30'
                                                : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                                            {selections[session.address] === oIdx ? 'Sélectionné ✓' : 'Choisir'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {/* Sticky Submission Bar */}
            <div className="fixed bottom-0 inset-x-0 z-50 p-6 pointer-events-none">
                <div className="max-w-4xl mx-auto pointer-events-auto">
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="bg-white/95 backdrop-blur-2xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[32px] p-4 flex items-center gap-6"
                    >
                        <div className="flex-1 flex items-center gap-4 px-4 border-r border-slate-100">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors ${completedSessions < totalSessions ? 'bg-orange-100 border-orange-200' : 'bg-emerald-100 border-emerald-200'}`}>
                                {completedSessions < totalSessions ? (
                                    <InformationCircleIcon className="w-5 h-5 text-orange-600" />
                                ) : (
                                    <ShieldCheckIconSolid className="w-5 h-5 text-emerald-600" />
                                )}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-xs font-black text-slate-900">
                                    {completedSessions < totalSessions
                                        ? `En attente de ${totalSessions - completedSessions} choix.`
                                        : "Prêt pour la soumission blockchain"}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Intégrité contrôlée</p>
                            </div>
                        </div>

                        <button
                            onClick={resetSelections}
                            className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                            title="Réinitialiser mes choix"
                        >
                            <ArrowPathIcon className="w-6 h-6" />
                        </button>

                        <button
                            onClick={handleVoteSubmit}
                            disabled={isSubmitting || completedSessions < totalSessions}
                            className={`h-14 px-10 rounded-[20px] font-black text-xs uppercase tracking-[0.15em] flex items-center gap-3 transition-all
                                ${completedSessions < totalSessions
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-[#0F172A] hover:bg-black text-white shadow-xl active:scale-[0.98]'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    Signature...
                                </>
                            ) : 'Soumettre mon vote'}
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default VoterInterface;
