import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
    GlobeAltIcon,
    MagnifyingGlassIcon,
    InboxArrowDownIcon,
    ChevronRightIcon,
    ShieldCheckIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon as ShieldCheckIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const VoterPage = () => {
    const navigate = useNavigate();
    const { loginWithGoogle, loginWithOffice365 } = useAuth();
    const [email, setEmail] = useState('');
    const [searching, setSearching] = useState(false);
    const [availableElections, setAvailableElections] = useState([]);
    const [selectedElection, setSelectedElection] = useState('');

    const autoSearch = async (userEmail) => {
        if (!userEmail) return;
        setEmail(userEmail);
        setSearching(true);
        try {
            const res = await fetch(`${API_URL}/scrutins/authorized?email=${encodeURIComponent(userEmail)}`);
            const result = await res.json();
            if (result.success) {
                // Backend already returns ONLY scrutins with at least one 
                // validated, non-invalidated session for this specific voter
                const elections = result.data || [];
                setAvailableElections(elections);
                if (elections.length === 0) {
                    toast.error("Aucun scrutin avec session validée trouvé pour votre compte.");
                } else {
                    toast.success(`${elections.length} scrutin(s) disponible(s) !`);
                }
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error("Discovery error:", err);
            toast.error("Erreur lors de la recherche des scrutins.");
        } finally {
            setSearching(false);
        }
    };

    const handleGoogleLogin = async () => {
        const u = await loginWithGoogle();
        if (u && u.email) {
            autoSearch(u.email);
        }
    };

    const handleMicrosoftLogin = async () => {
        const u = await loginWithOffice365();
        if (u && u.email) {
            autoSearch(u.email);
        }
    };

    const handleGoToVote = () => {
        if (!selectedElection) return;
        navigate(`/vote/${selectedElection}`, { state: { intendedEmail: email } });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 pb-20 font-sans">
            {/* Header Section */}
            <div className="text-center mb-10">
                <h1 className="text-[44px] font-black text-[#0F172A] mb-3 tracking-tight">Voter Authentication</h1>
                <p className="text-[#64748B] font-medium text-lg">Veuillez vous identifier pour accéder au scrutin en cours.</p>
            </div>

            <div className="max-w-[480px] w-full bg-white rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-slate-100 flex flex-col transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)]">
                {/* Visual Header Section (Template Style) */}
                <div className="h-[200px] bg-[#F1F5F9] relative flex flex-col items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                    <div className="w-16 h-16 bg-white rounded-[24px] shadow-sm flex items-center justify-center mb-4 relative z-10">
                        <ShieldCheckIconSolid className="h-8 w-8 text-primary-600" />
                    </div>
                    <h2 className="text-xl font-black text-[#334155] uppercase tracking-[0.1em] relative z-10">Portail de vote sécurisé</h2>
                </div>

                <div className="p-10">
                    <div className="mb-0">
                        <h3 className="text-2xl font-black text-[#0F172A] mb-2 leading-tight">Connectez-vous pour voter</h3>
                        <p className="text-[#64748B] text-sm font-medium mb-10 leading-relaxed">
                            Choisissez votre méthode d'authentification préférée pour continuer.
                        </p>
                    </div>

                    {/* Authentication Section */}
                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={searching}
                            className="w-full h-15 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all font-bold text-[#334155] shadow-sm active:scale-[0.98] py-4 disabled:opacity-60"
                        >
                            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                            {searching ? 'Recherche en cours...' : 'Se connecter avec Google'}
                        </button>

                        <button
                            onClick={handleMicrosoftLogin}
                            disabled={searching}
                            className="w-full h-15 bg-[#2563EB] rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all font-bold text-white shadow-md active:scale-[0.98] py-4 disabled:opacity-60"
                        >
                            <img src="https://www.microsoft.com/favicon.ico" className="w-5 h-5 brightness-0 invert" alt="Microsoft" />
                            Se connecter avec Office 365
                        </button>
                    </div>

                    {availableElections.length > 0 && (
                        <div className="mt-10 pt-10 border-t border-slate-100 animate-fade-in">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Sessions de vote disponibles</label>
                            <div className="relative mb-6">
                                <InboxArrowDownIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500 shadow-sm" />
                                <select
                                    value={selectedElection}
                                    onChange={(e) => setSelectedElection(e.target.value)}
                                    className="w-full pl-12 pr-10 py-4 bg-primary-50 border border-primary-100 rounded-2xl appearance-none focus:ring-2 focus:ring-primary-500 font-black text-primary-900 cursor-pointer transition-all text-sm"
                                >
                                    <option value="">Choisir un scrutin...</option>
                                    {availableElections.map(el => (
                                        <option key={el.address} value={el.address}>
                                            {el.title} ({el.country})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary-400">
                                    <ChevronRightIcon className="w-5 h-5 rotate-90" />
                                </div>
                            </div>

                            <Button
                                onClick={handleGoToVote}
                                disabled={!selectedElection}
                                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white shadow-xl transition-all active:scale-[0.98]"
                            >
                                Accéder au portail de vote
                            </Button>
                        </div>
                    )}

                    <div className="mt-10 p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed text-center">
                            L'identification par certificat Google ou Office 365 est requise pour garantir l'unicité de votre vote sur la blockchain.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Info Section (Blockchain Badge) */}
            <div className="mt-8 max-w-[440px] w-full bg-[#F1F5F9]/50 backdrop-blur-sm border border-slate-200 rounded-[28px] p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                    <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">SÉCURISATION</span>
                        <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vérification par Blockchain</span>
                    </div>
                    <p className="text-[9px] font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-1.5 line-clamp-1">
                        <LockClosedIcon className="w-3 h-3" /> INTÉGRITÉ GARANTIE
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VoterPage;