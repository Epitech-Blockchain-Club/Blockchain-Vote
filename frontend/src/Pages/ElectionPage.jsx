import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useElections } from '../contexts/ElectionContext'
import { useAuth } from '../contexts/AuthContext'
import CandidateCard from '../components/elections/CandidateCard'
import CountdownTimer from '../components/common/CountdownTimer'
import Button from '../components/common/Button'
import { CalendarIcon, MapPinIcon, UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { COUNTRY_NAMES } from '../constants/countries'

const ElectionPage = () => {
  const { id } = useParams()
  const { elections } = useElections()
  const { user } = useAuth()
  const election = elections.find(e => e.id === id)

  if (!election) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-2xl">
        <div className="bg-red-50 border border-red-100 p-12 rounded-3xl shadow-xl shadow-red-500/5">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-red-100 flex items-center justify-center mb-8 mx-auto">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-red-600 mb-4 tracking-tight">Scrutin Introuvable</h1>
          <p className="text-red-700/60 mb-10 font-medium">L'élection que vous recherchez n'existe pas, a été archivée, ou le lien est corrompu.</p>
          <Link to="/">
            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-100/50 h-12 px-8">
              Retour au tableau de bord
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const now = new Date()
  const isActive = now >= new Date(election.startDate) && now <= new Date(election.endDate)
  const hasVoted = election.voters?.includes(user?.email)

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10">
        <Link to="/" className="group inline-flex items-center text-slate-400 hover:text-primary-600 transition-all font-black uppercase text-[10px] tracking-widest">
          <span className="mr-3 p-1.5 bg-slate-50 rounded-lg group-hover:bg-primary-50 transition-colors">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </span>
          Retour aux scrutins
        </Link>
      </div>

      <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden mb-12">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <ShieldCheckIcon className="w-48 h-48 text-slate-900" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-start mb-10 gap-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-[0.9]">
              {election.title}
            </h1>
            {election.moderators && election.moderators.length > 0 && (
              <div className="flex items-center text-primary-600 text-[10px] font-black uppercase tracking-widest bg-primary-50 w-fit px-4 py-1.5 rounded-full border border-primary-100">
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                Géré par {election.moderators.length} certificateurs
              </div>
            )}
          </div>

          <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${isActive ? 'bg-primary-50 text-primary-600 border-primary-100 animate-pulse' :
            now < new Date(election.startDate) ? 'bg-amber-50 text-amber-600 border-amber-100' :
              'bg-slate-50 text-slate-400 border-slate-200'
            }`}>
            {isActive ? '● Vote ouvert' :
              now < new Date(election.startDate) ? 'Démarre bientôt' : 'Scrutin clos'}
          </span>
        </div>

        <div className="relative mb-12">
          <p className="text-slate-500 text-xl font-medium leading-relaxed max-w-4xl">
            {election.description}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: <CalendarIcon className="h-6 w-6 text-primary-500" />, label: "Ouverture", value: new Date(election.startDate).toLocaleDateString() },
            { icon: <CalendarIcon className="h-6 w-6 text-primary-500" />, label: "Fermeture", value: new Date(election.endDate).toLocaleDateString() },
            { icon: <MapPinIcon className="h-6 w-6 text-secondary-500" />, label: "Territoire", value: COUNTRY_NAMES[election.country] || "Global" },
            { icon: <UserGroupIcon className="h-6 w-6 text-primary-500" />, label: "Participation", value: `${election.voters?.length || 0} inscrits` }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 hover:border-primary-100 transition-all group">
              <div className="mb-4 bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">{stat.label}</p>
              <p className="text-slate-900 font-black text-sm">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-16">
          <CountdownTimer targetDate={election.endDate} />
        </div>

        <div className="mt-20 mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Liste des choix</h2>
            <p className="text-slate-500 text-sm font-medium">Sélectionnez une option pour enregistrer votre vote</p>
          </div>
          <span className="text-primary-600 text-[10px] font-black bg-primary-50 py-2 px-5 rounded-full border border-primary-100 tracking-tighter uppercase">{election.candidates.length} options disponibles</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {election.candidates.map(candidate => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              votes={election.votes?.[candidate.id] || 0}
              showVotes={!isActive}
            />
          ))}
        </div>

        {user && isActive && !hasVoted && (
          <div className="mt-20 text-center p-12 bg-slate-900 rounded-[40px] shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <svg className="w-32 h-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-3xl font-black text-white mb-4 relative z-10">Signez votre bulletin</h3>
            <p className="text-slate-400 mb-10 text-lg font-medium relative z-10 max-w-xl mx-auto">Votre identité institutionnelle a été vérifiée. Vous pouvez maintenant participer de manière anonyme.</p>
            <Link to={`/vote/${id}`} className="relative z-10">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 h-16 px-16 rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl hover:-translate-y-1 transition-all">Voter maintenant</Button>
            </Link>
          </div>
        )}

        {hasVoted && (
          <div className="mt-20 p-12 bg-primary-50 rounded-[40px] border border-primary-100 text-center flex flex-col items-center">
            <div className="h-20 w-20 bg-white rounded-[24px] shadow-sm border border-primary-100 flex items-center justify-center mb-8">
              <svg className="w-10 h-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Vote enregistré avec succès</h3>
            <p className="text-slate-500 font-medium text-lg max-w-lg mb-8">Votre participation a été scellée cryptographiquement sur la blockchain. Merci de contribuer à la gouvernance de l'EBC.</p>
            <Link to="/results">
              <Button variant="outline" className="border-primary-200 text-primary-600 bg-white font-bold h-12 px-8">Consulter les résultats live</Button>
            </Link>
          </div>
        )}

        {!user && isActive && (
          <div className="mt-20 text-center p-12 bg-slate-50 rounded-[40px] border border-slate-200 flex flex-col items-center">
            <div className="h-20 w-20 bg-white rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-center mb-8">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Authentification requise</h3>
            <p className="text-slate-500 mb-10 max-w-lg font-medium text-lg">Pour voter, identifiez-vous via votre email institutionnel. La blockchain protégera votre secret par hachage.</p>
            <Link to={`/vote/${id}`} className="relative z-10">
              <Button size="lg" className="h-14 px-12 font-black uppercase tracking-widest text-xs">Vérifier mon identité</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ElectionPage