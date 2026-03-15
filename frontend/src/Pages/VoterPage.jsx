import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useElections } from '../contexts/ElectionContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { GlobeAltIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const VoterPage = () => {
    const navigate = useNavigate();
    const { user, loginWithGoogle } = useAuth();
    const { elections } = useElections();
    const [availableElections, setAvailableElections] = useState([]);

    useEffect(() => {
        if (user && elections) {
            const userEmail = user.email.toLowerCase();
            // Find all elections where user is in at least one session
            const filtered = elections.filter(el => 
                el.sessions?.some(s => s.voters?.some(v => v.toLowerCase() === userEmail))
            );
            setAvailableElections(filtered);
        }
    }, [user, elections]);

    if (!user) {
        return (
            <div className="max-w-md mx-auto py-20 text-center px-4">
                <h1 className="text-4xl font-black mb-4">Espace Électeur</h1>
                <p className="text-slate-500 mb-8 font-medium">Connectez-vous pour voir vos scrutins en cours.</p>
                <Button onClick={loginWithGoogle} className="w-full h-14 rounded-2xl shadow-xl shadow-primary-500/20">
                    S'identifier (Google/Office)
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <header className="mb-10">
                <h1 className="text-4xl font-black text-slate-900 mb-2">Vos Scrutins</h1>
                <p className="text-slate-500 font-medium">Liste des votes auxquels vous êtes invité à participer.</p>
            </header>

            {availableElections.length === 0 ? (
                <Card className="p-12 text-center bg-slate-50 border-dashed border-2 border-slate-200">
                    <p className="text-slate-400 font-bold uppercase tracking-widest">Aucun scrutin trouvé pour {user.email}</p>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {availableElections.map(el => (
                        <div 
                            key={el.id} 
                            onClick={() => navigate(`/vote/${el.id}`)}
                            className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary-200 transition-all cursor-pointer flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                    <GlobeAltIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">{el.title}</h3>
                                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{el.country || 'International'}</p>
                                </div>
                            </div>
                            <ChevronRightIcon className="w-6 h-6 text-slate-300 group-hover:text-primary-500 translate-x-0 group-hover:translate-x-2 transition-all" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VoterPage;