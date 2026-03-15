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
    const { user, loginWithGoogle } = useAuth();
    const { getElectionById } = useElections();
    const [election, setElection] = useState(null);
    const [authorizedSessions, setAuthorizedSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

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
    }, [id, user, getElectionById, navigate]);

    if (loading) return <div className="py-20 text-center font-black animate-pulse">Vérification des accès...</div>;

    if (!user) {
        return (
            <div className="max-w-md mx-auto py-20 px-4 text-center">
                <h2 className="text-3xl font-black mb-6">Authentification Requise</h2>
                <p className="text-slate-500 mb-8">Veuillez vous connecter avec votre compte institutionnel pour accéder à ce vote.</p>
                <Button onClick={loginWithGoogle} className="w-full h-14 rounded-2xl">Se connecter avec Google / Office</Button>
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
