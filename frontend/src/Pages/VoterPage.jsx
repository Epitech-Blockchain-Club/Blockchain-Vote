import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import {
    ShieldCheckIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon as ShieldCheckIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== '""' ? import.meta.env.VITE_API_URL : '/api';

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
                const elections = result.data || [];
                setAvailableElections(elections);
                if (elections.length === 0) {
                    toast.error("Aucun scrutin disponible pour votre compte.");
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
        if (u && u.email) autoSearch(u.email);
    };

    const handleMicrosoftLogin = async () => {
        const u = await loginWithOffice365();
        if (u && u.email) autoSearch(u.email);
    };

    const handleGoToVote = () => {
        if (!selectedElection) return;
        navigate(`/vote/${selectedElection}`, { state: { intendedEmail: email } });
    };

    const handleReset = () => {
        setEmail('');
        setAvailableElections([]);
        setSelectedElection('');
    };

    const isAuthenticated = email.length > 0;
    const hasElections = availableElections.length > 0;

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 pb-20 font-sans">
            {/* Page Title */}
            <div className="text-center mb-10">
                <h1 className="text-[44px] font-black text-[#0F172A] mb-3 tracking-tight">Voter Authentication</h1>
                <p className="text-[#64748B] font-medium text-lg">Veuillez vous identifier pour accéder au scrutin en cours.</p>
            </div>

            {/* Main Card */}
            <div className="max-w-[480px] w-full bg-white rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-slate-100 transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)]">

                {/* Card Header — changes color after auth */}
                <div className={`h-[180px] relative flex flex-col items-center justify-center overflow-hidden transition-colors duration-500 ${isAuthenticated ? 'bg-primary-600' : 'bg-[#F1F5F9]'}`}>
                    <div
                        className="absolute inset-0 opacity-[0.15] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                    />
                    <div className={`w-16 h-16 rounded-[24px] shadow-sm flex items-center justify-center mb-3 relative z-10 transition-all duration-500 ${isAuthenticated ? 'bg-white/20' : 'bg-white'}`}>
                        <ShieldCheckIconSolid className={`h-8 w-8 transition-colors duration-500 ${isAuthenticated ? 'text-white' : 'text-primary-600'}`} />
                    </div>
                    <h2 className={`text-xl font-black uppercase tracking-[0.1em] relative z-10 transition-colors duration-500 ${isAuthenticated ? 'text-white' : 'text-[#334155]'}`}>
                        {isAuthenticated ? 'Sélectionnez un scrutin' : 'Portail de vote sécurisé'}
                    </h2>
                    {isAuthenticated && (
                        <p className="text-white/70 text-xs font-semibold mt-1 relative z-10 truncate max-w-xs">{email}</p>
                    )}
                </div>

                {/* Card Body */}
                <div className="p-10">
                    {!isAuthenticated ? (
                        /* STEP 1 — Login buttons */
                        <div>
                            <h3 className="text-2xl font-black text-[#0F172A] mb-2 leading-tight">Connectez-vous pour voter</h3>
                            <p className="text-[#64748B] text-sm font-medium mb-8 leading-relaxed">
                                Choisissez votre méthode d'authentification préférée pour continuer.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={searching}
                                    className="w-full bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all font-bold text-[#334155] shadow-sm active:scale-[0.98] py-4 disabled:opacity-60"
                                >
                                    <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                                    Se connecter avec Gmail
                                </button>
                                <button
                                    onClick={handleMicrosoftLogin}
                                    disabled={searching}
                                    className="w-full bg-[#2563EB] rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all font-bold text-white shadow-md active:scale-[0.98] py-4 disabled:opacity-60"
                                >
                                    <img src="https://www.microsoft.com/favicon.ico" className="w-5 h-5 brightness-0 invert" alt="Microsoft" />
                                    Se connecter avec Office 365
                                </button>
                            </div>
                            <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <p className="text-[11px] text-slate-500 font-bold leading-relaxed text-center">
                                    L'identification est requise pour garantir l'unicité de votre vote sur la blockchain.
                                </p>
                            </div>
                        </div>
                    ) : searching ? (
                        /* STEP 2 — Loading spinner */
                        <div className="flex flex-col items-center justify-center py-8 gap-4">
                            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-500 font-semibold text-sm">Recherche des scrutins disponibles...</p>
                        </div>
                    ) : hasElections ? (
                        /* STEP 3a — Radio list of elections */
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                {availableElections.length} scrutin(s) disponible(s)
                            </p>
                            <div className="space-y-3 mb-8">
                                {availableElections.map(el => (
                                    <label
                                        key={el.address}
                                        htmlFor={`election-${el.address}`}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${selectedElection === el.address
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-slate-100 bg-slate-50 hover:border-primary-200 hover:bg-primary-50/30'
                                            }`}
                                    >
                                        <input
                                            id={`election-${el.address}`}
                                            type="radio"
                                            name="election"
                                            value={el.address}
                                            checked={selectedElection === el.address}
                                            onChange={() => setSelectedElection(el.address)}
                                            className="accent-primary-600 w-4 h-4 shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-900 truncate">{el.title}</p>
                                            {el.country && <p className="text-xs text-slate-400 font-semibold">{el.country}</p>}
                                        </div>
                                        {selectedElection === el.address && (
                                            <ShieldCheckIcon className="w-4 h-4 text-primary-600 shrink-0" />
                                        )}
                                    </label>
                                ))}
                            </div>
                            <Button
                                onClick={handleGoToVote}
                                disabled={!selectedElection}
                                className="w-full h-14 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white shadow-xl shadow-primary-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                Accéder au vote →
                            </Button>
                            <button
                                onClick={handleReset}
                                className="mt-4 w-full text-xs text-slate-400 hover:text-slate-600 font-semibold text-center transition-colors"
                            >
                                Choisir un autre compte
                            </button>
                        </div>
                    ) : (
                        /* STEP 3b — No elections found */
                        <div className="flex flex-col items-center py-6 gap-4 text-center">
                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                                <LockClosedIcon className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-800 mb-1">Aucun scrutin disponible</p>
                                <p className="text-xs text-slate-400 font-medium">
                                    Votre compte ({email}) ne figure sur aucune liste électorale active.
                                </p>
                            </div>
                            <button
                                onClick={handleReset}
                                className="text-xs text-primary-600 hover:text-primary-700 font-bold underline"
                            >
                                Réessayer avec un autre compte
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Blockchain Badge */}
            <div className="mt-8 max-w-[440px] w-full bg-[#F1F5F9]/50 backdrop-blur-sm border border-slate-200 rounded-[28px] p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                    <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">SÉCURISATION</span>
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vérification par Blockchain</span>
                    </div>
                    <p className="text-[9px] font-bold text-primary-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <LockClosedIcon className="w-3 h-3" /> INTÉGRITÉ GARANTIE
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VoterPage;