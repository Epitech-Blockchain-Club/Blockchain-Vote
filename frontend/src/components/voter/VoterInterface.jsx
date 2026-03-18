import React, { useState } from 'react';
import { useConfetti } from '../../hooks/useConfetti';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
    CheckBadgeIcon,
    InformationCircleIcon,
    ArrowPathIcon,
    UserGroupIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon as ShieldCheckIconSolid } from '@heroicons/react/24/solid';
import CountdownTimer from '../common/CountdownTimer';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const VoterInterface = ({ election, authorizedSessions, user }) => {
    const navigate = useNavigate();
    const { celebrate } = useConfetti();
    const [selections, setSelections] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVoted, setIsVoted] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [detailCandidate, setDetailCandidate] = useState(null);

    if (!election || election === 'unauthorized') {
        return <div className="py-20 text-center font-black animate-pulse text-slate-400">Chargement...</div>;
    }

    // Not started yet
    const now = new Date();
    if (election.startDate && now < new Date(election.startDate)) {
        return (
            <div className="max-w-sm mx-auto py-16 px-4 text-center">
                <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8 mb-6">
                    <h2 className="text-xl font-black text-slate-900 mb-1 tracking-tight">Scrutin pas encore ouvert</h2>
                    <p className="text-slate-500 text-sm font-medium">
                        Ouverture le <span className="font-bold text-slate-700">{new Date(election.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                </div>
                <CountdownTimer startDate={election.startDate} endDate={election.endDate} />
            </div>
        );
    }

    const totalSessions = authorizedSessions.length;
    const completedSessions = Object.keys(selections).length;
    const progress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    const allDone = completedSessions === totalSessions;

    const handleVoteSubmit = async () => {
        if (!allDone) {
            toast.error(`Veuillez voter pour les ${totalSessions} sessions.`);
            return;
        }
        setIsSubmitting(true);
        try {
            const scrutinAddr = election.id || election.address;
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/scrutins/${scrutinAddr}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: user.email, selections }),
            });
            const result = await res.json();
            if (result.success) {
                setIsVoted(true);
                celebrate();
                toast.success('Votre vote a été scellé sur la blockchain.');
                setTimeout(() => navigate('/'), 5000);
            } else {
                throw new Error(result.error || 'Échec de la soumission.');
            }
        } catch (error) {
            toast.error(error.message || 'Un seul vote par électeur est permis.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Vote enregistré ────────────────────────────────────────────────────────
    if (isVoted) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mb-6 border border-emerald-200"
                >
                    <CheckBadgeIcon className="h-10 w-10 text-emerald-600" />
                </motion.div>
                <motion.h2
                    initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
                    className="text-3xl font-black text-slate-900 mb-3 tracking-tight"
                >
                    Vote enregistré !
                </motion.h2>
                <motion.p
                    initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
                    className="text-slate-400 font-medium text-sm mb-8"
                >
                    Merci pour votre participation.
                </motion.p>
                <motion.button
                    initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}
                    onClick={() => navigate('/')}
                    className="px-8 h-12 rounded-2xl border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                    Retour à l'accueil
                </motion.button>
            </div>
        );
    }

    // ── Interface de vote ──────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24">

            {/* Header slim sticky */}
            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 sm:px-6 py-3">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <h1 className="flex-1 text-sm font-black text-slate-900 truncate">{election.title}</h1>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {completedSessions}/{totalSessions}
                        </span>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                animate={{ width: `${progress}%` }}
                                className={`h-full rounded-full transition-colors ${allDone ? 'bg-emerald-500' : 'bg-primary-500'}`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sessions */}
            <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-10">
                {authorizedSessions.map((session, sIdx) => {
                    const isSessionDone = selections[session.address] !== undefined;
                    return (
                        <section key={session.address || sIdx}>
                            {/* Session title */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">
                                        {sIdx + 1}
                                    </span>
                                    <h2 className="text-base font-black text-slate-900 tracking-tight">{session.title}</h2>
                                </div>
                                {isSessionDone && (
                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 shrink-0">
                                        ✓ Sélectionné
                                    </span>
                                )}
                            </div>

                            {/* Candidate cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                                {(session.options || []).map((option, oIdx) => {
                                    const isSelected = selections[session.address] === oIdx;
                                    return (
                                        <div
                                            key={oIdx}
                                            onClick={() => setSelections(prev => ({ ...prev, [session.address]: oIdx }))}
                                            className={`relative bg-white rounded-2xl border-2 cursor-pointer transition-all duration-200 overflow-hidden flex flex-col
                                                ${isSelected
                                                    ? 'border-primary-500 shadow-lg shadow-primary-100/60'
                                                    : 'border-slate-100 hover:border-slate-300 hover:shadow-md'
                                                }`}
                                        >
                                            {/* Image */}
                                            {option.imageUrl && (
                                                <div className="aspect-[4/3] sm:aspect-[3/2] overflow-hidden bg-slate-100">
                                                    <img src={option.imageUrl} alt={option.title} className="w-full h-full object-cover" />
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div className="p-2.5 sm:p-4 flex flex-col flex-1">
                                                <div className="flex items-start justify-between gap-1.5 mb-2">
                                                    <h3 className={`text-sm font-black leading-tight ${isSelected ? 'text-primary-700' : 'text-slate-900'}`}>
                                                        {option.title}
                                                    </h3>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setDetailCandidate({ option, session, idx: oIdx }); }}
                                                        className="shrink-0 p-1 rounded-lg text-slate-300 hover:text-primary-500 hover:bg-primary-50 transition-all"
                                                        title="Voir les détails"
                                                    >
                                                        <InformationCircleIcon className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {/* Members preview */}
                                                {option.members?.length > 0 && (
                                                    <div className="flex -space-x-1.5 mb-2">
                                                        {option.members.slice(0, 5).map((m, mi) => (
                                                            <div key={mi} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white overflow-hidden shrink-0">
                                                                {m.photoUrl
                                                                    ? <img src={m.photoUrl} alt="" className="w-full h-full object-cover" />
                                                                    : <UserCircleIcon className="w-full h-full text-slate-300 p-0.5" />
                                                                }
                                                            </div>
                                                        ))}
                                                        {option.members.length > 5 && (
                                                            <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                                                                <span className="text-[8px] font-black text-slate-500">+{option.members.length - 5}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Select button */}
                                                <div className={`mt-auto py-1.5 rounded-lg font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-center transition-all
                                                    ${isSelected
                                                        ? 'bg-primary-500 text-white'
                                                        : 'bg-slate-50 text-slate-400'
                                                    }`}
                                                >
                                                    {isSelected ? '✓ Sélectionné' : 'Choisir'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* Detail Modal */}
            {detailCandidate && (
                <div
                    className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-sm"
                    onClick={() => setDetailCandidate(null)}
                >
                    <motion.div
                        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        className="bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl w-full sm:max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {detailCandidate.option.imageUrl && (
                            <div className="aspect-video w-full overflow-hidden bg-slate-100 shrink-0">
                                <img src={detailCandidate.option.imageUrl} alt={detailCandidate.option.title} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="p-6 overflow-y-auto">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{detailCandidate.session.title}</p>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-3">{detailCandidate.option.title}</h2>
                            {detailCandidate.option.description && (
                                <p className="text-sm text-slate-600 font-medium leading-relaxed mb-5 border-l-2 border-primary-200 pl-3 italic">
                                    "{detailCandidate.option.description}"
                                </p>
                            )}
                            {detailCandidate.option.members?.length > 0 && (
                                <div className="mb-5">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                        <UserGroupIcon className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                                        {detailCandidate.option.members.length} membre{detailCandidate.option.members.length > 1 ? 's' : ''}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {detailCandidate.option.members.map((member, mi) => (
                                            <div key={mi} className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                    {member.photoUrl
                                                        ? <img src={member.photoUrl} alt="" className="w-full h-full object-cover" />
                                                        : <UserCircleIcon className="w-4 h-4 text-slate-400" />
                                                    }
                                                </div>
                                                <span className="text-xs font-bold text-slate-700 truncate">{member.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2 pt-1">
                                <button
                                    onClick={() => setDetailCandidate(null)}
                                    className="flex-1 h-11 rounded-2xl border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    Fermer
                                </button>
                                <button
                                    onClick={() => {
                                        setSelections(prev => ({ ...prev, [detailCandidate.session.address]: detailCandidate.idx }));
                                        setDetailCandidate(null);
                                    }}
                                    className="flex-1 h-11 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                                >
                                    Choisir cette option
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        className="bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl w-full sm:max-w-md p-6"
                    >
                        <h3 className="font-black text-slate-900 text-lg tracking-tight mb-5">Confirmer votre vote</h3>

                        <div className="space-y-2 mb-6">
                            {authorizedSessions.map((session) => {
                                const option = session.options?.[selections[session.address]];
                                return (
                                    <div key={session.address} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5 gap-3">
                                        <span className="text-xs font-bold text-slate-500 truncate">{session.title}</span>
                                        <span className="text-xs font-black text-primary-700 bg-white px-2.5 py-1 rounded-lg border border-primary-100 shrink-0 max-w-[55%] truncate text-right">
                                            {option?.title || '—'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 h-12 rounded-2xl border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Modifier
                            </button>
                            <button
                                onClick={() => { setShowConfirm(false); handleVoteSubmit(); }}
                                disabled={isSubmitting}
                                className="flex-1 h-12 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting
                                    ? <><div className="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full" /> Signature...</>
                                    : 'Confirmer'
                                }
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Sticky bottom bar */}
            <div className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 pointer-events-none">
                <div className="max-w-3xl mx-auto pointer-events-auto">
                    <motion.div
                        initial={{ y: 80 }} animate={{ y: 0 }}
                        className="bg-white/95 backdrop-blur-xl border border-slate-100 shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3"
                    >
                        {/* Progress pill */}
                        <div className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${allDone ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            {completedSessions}/{totalSessions}
                        </div>

                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                animate={{ width: `${progress}%` }}
                                className={`h-full rounded-full transition-colors ${allDone ? 'bg-emerald-500' : 'bg-primary-500'}`}
                            />
                        </div>

                        <button
                            onClick={() => { setSelections({}); toast.success('Choix réinitialisés.'); }}
                            className="shrink-0 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            title="Réinitialiser"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => setShowConfirm(true)}
                            disabled={isSubmitting || !allDone}
                            className={`shrink-0 h-10 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2
                                ${allDone
                                    ? 'bg-slate-900 text-white hover:bg-black shadow-lg active:scale-[0.98]'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            {isSubmitting
                                ? <><div className="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full" /> Signature...</>
                                : <><ShieldCheckIconSolid className="w-3.5 h-3.5" /> Soumettre</>
                            }
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default VoterInterface;
