import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useElections } from '../contexts/ElectionContext';
import VoterInterface from '../components/voter/VoterInterface';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const VoterPortalPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, loginWithGoogle, loginWithOffice365 } = useAuth();
    const { getElectionById, loading: electionsLoading } = useElections();
    const [election, setElection] = useState(null);
    const [authorizedSessions, setAuthorizedSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            // Wait for the elections list to finish loading before searching
            if (electionsLoading) return;

            const el = await getElectionById(id);
            if (!el) {
                toast.error("Scrutin introuvable.");
                navigate('/');
                return;
            }

            // Filter sessions where the user's email is present
            const userEmail = user.email.toLowerCase();
            const allowed = el.sessions.filter(s =>
                s.voters?.some(v => v.toLowerCase() === userEmail)
            );

            if (allowed.length === 0) {
                toast.error("Vous n'êtes autorisé à voter pour aucune session de ce scrutin.");
                setElection('unauthorized');
            } else {
                setElection(el);
                setAuthorizedSessions(allowed);
            }
            setLoading(false);
        };

        checkAccess();
    }, [id, user, electionsLoading, getElectionById, navigate]);

    if (loading) return <div className="py-20 text-center font-black animate-pulse">Vérification des accès...</div>;

    if (!user) {
        return (
            <div className="max-w-md mx-auto py-20 px-4 text-center">
                <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 border border-primary-100 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Accès sécurisé
                </div>
                <h2 className="text-3xl font-black mb-3">Identifiez-vous pour voter</h2>
                <p className="text-slate-500 mb-2 text-sm leading-relaxed">
                    Ce scrutin est réservé aux participants autorisés. Connectez-vous avec le compte sur lequel vous avez été invité.
                </p>
                <p className="text-slate-400 text-xs mb-8">
                    Vous serez automatiquement redirigé vers le vote après connexion.
                </p>
                <div className="space-y-3">
                    <button
                        onClick={loginWithGoogle}
                        className="w-full h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all font-bold text-[#334155] shadow-sm active:scale-[0.98]"
                    >
                        <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                        Se connecter avec Google
                    </button>
                    <button
                        onClick={loginWithOffice365}
                        className="w-full h-14 bg-[#2563EB] rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all font-bold text-white shadow-md active:scale-[0.98]"
                    >
                        <img src="https://www.microsoft.com/favicon.ico" className="w-5 h-5 brightness-0 invert" alt="Microsoft" />
                        Se connecter avec Office 365
                    </button>
                </div>
            </div>
        );
    }

    if (election === 'unauthorized') {
        return (
            <div className="max-w-md mx-auto py-20 px-4 text-center">
                <div className="bg-red-50 text-red-600 p-8 rounded-[40px] border border-red-100 mb-8">
                    <h2 className="text-2xl font-black mb-2">Accès Refusé</h2>
                    <p className="font-medium text-sm">Votre email ({user.email}) ne figure pas sur les listes électorales de ce scrutin.</p>
                </div>
                <Button onClick={() => navigate('/')} variant="outline" className="w-full">Retour à l'accueil</Button>
            </div>
        );
    }

    return <VoterInterface election={election} authorizedSessions={authorizedSessions} user={user} />;
};

export default VoterPortalPage;
