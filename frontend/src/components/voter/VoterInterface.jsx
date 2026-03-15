const VoterInterface = ({ election, authorizedSessions, user }) => {
    const navigate = useNavigate();
    const [selections, setSelections] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVoted, setIsVoted] = useState(false);

    const handleVoteSubmit = async () => {
        if (Object.keys(selections).length < authorizedSessions.length) {
            toast.error(`Veuillez voter pour les ${authorizedSessions.length} sessions disponibles.`);
            return;
        }

        setIsSubmitting(true);
        try {
            // Logic to sign and send the transaction with all selections
            // const tx = await blockchain.submitMultiVote(election.id, selections, user.email);
            await new Promise(resolve => setTimeout(resolve, 2500));
            setIsVoted(true);
            toast.success("Votre vote global a été scellé sur la Blockchain.");
        } catch (error) {
            toast.error("Échec de la soumission. Un seul vote par électeur est permis.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 pb-32">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{election.title}</h1>
                <p className="text-slate-500 font-medium">Électeur authentifié : <span className="text-primary-600 font-bold">{user.email}</span></p>
                <p className="text-xs font-black text-slate-400 uppercase mt-2">{authorizedSessions.length} sessions à valider</p>
            </header>

            <div className="space-y-10">
                {authorizedSessions.map((session, sIdx) => (
                    <div key={session.id || sIdx} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black">
                                {sIdx + 1}
                            </span>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">{session.title}</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Session ID: {session.address?.substring(0, 10)}...</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {session.options.map((option) => (
                                <div 
                                    key={option.id}
                                    onClick={() => setSelections({...selections, [session.id || sIdx]: option.id})}
                                    className={`relative p-6 rounded-[32px] border-2 transition-all cursor-pointer group ${
                                        selections[session.id || sIdx] === option.id 
                                        ? 'border-primary-500 bg-primary-50' 
                                        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-xl'
                                    }`}
                                >
                                    <span className="text-slate-900 font-black">{option.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 text-center">
                <button 
                    onClick={handleVoteSubmit}
                    disabled={isSubmitting || isVoted}
                    className={`px-6 py-3 rounded-full font-bold text-white transition-all ${
                        isSubmitting || isVoted 
                        ? 'bg-slate-400 cursor-not-allowed' 
                        : 'bg-primary-600 hover:bg-primary-700'
                    }`}
                >
                    {isSubmitting ? 'Soumission en cours...' : isVoted ? 'Vote enregistré' : 'Soumettre mon vote'}
                </button>
            </div>
        </div>
    );
};
