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
      <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
        <div className="card border-red-500/30 bg-red-500/10">
          <h1 className="text-3xl font-bold text-white mb-4">Élection introuvable</h1>
          <p className="text-slate-400 mb-8">L'élection que vous recherchez n'existe pas ou a été supprimée.</p>
          <Link to="/" className="btn-primary inline-flex items-center">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  const now = new Date()
  const isActive = now >= new Date(election.startDate) && now <= new Date(election.endDate)
  const hasVoted = election.voters?.includes(user?.email)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="text-indigo-400 hover:text-indigo-300 mb-8 inline-flex items-center transition-colors font-medium">
          <span className="mr-2">←</span> Retour aux élections
        </Link>

        <div className="card mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
                {election.title}
              </h1>
              {election.moderators && election.moderators.length > 0 && (
                <div className="flex items-center text-indigo-400 text-sm mt-2">
                  <ShieldCheckIcon className="h-4 w-4 mr-1" />
                  Supervisée par {election.moderators.length} modérateur(s)
                </div>
              )}
            </div>

            <span className={`px-4 py-2 rounded-full text-sm font-bold border shadow-lg ${isActive ? 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse' :
                now < new Date(election.startDate) ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  'bg-slate-700/50 text-slate-300 border-slate-600/50'
              }`}>
              {isActive ? '● En cours' :
                now < new Date(election.startDate) ? 'À venir' : 'Terminée'}
            </span>
          </div>

          <p className="text-slate-300 text-lg mb-8 leading-relaxed border-l-4 border-indigo-500/50 pl-4 py-1">
            {election.description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 hover:bg-slate-800/80 transition-colors">
              <CalendarIcon className="h-6 w-6 text-indigo-400 mb-3" />
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Début</p>
              <p className="text-white font-medium">{new Date(election.startDate).toLocaleDateString()}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 hover:bg-slate-800/80 transition-colors">
              <CalendarIcon className="h-6 w-6 text-indigo-400 mb-3" />
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Fin</p>
              <p className="text-white font-medium">{new Date(election.endDate).toLocaleDateString()}</p>
            </div>
            {election.country && (
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 hover:bg-slate-800/80 transition-colors">
                <MapPinIcon className="h-6 w-6 text-indigo-400 mb-3" />
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Localisation</p>
                <p className="text-white font-medium">{COUNTRY_NAMES[election.country]}</p>
              </div>
            )}
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 hover:bg-slate-800/80 transition-colors">
              <UserGroupIcon className="h-6 w-6 text-indigo-400 mb-3" />
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Votants</p>
              <p className="text-white font-medium text-xl">{election.voters?.length || 0}</p>
            </div>
          </div>

          {isActive && (
            <div className="mb-8">
              <CountdownTimer targetDate={election.endDate} />
            </div>
          )}

          <div className="mt-12 mb-6 flex justify-between items-end border-b border-slate-700/50 pb-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Candidats en lice</h2>
            <span className="text-slate-400 text-sm bg-slate-800 py-1 px-3 rounded-full">{election.candidates.length} candidats</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
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
            <div className="mt-12 text-center p-8 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-4">Votre vote compte</h3>
              <p className="text-slate-400 mb-6">Le vote est anonyme et sécurisé par la blockchain.</p>
              <Link to="/voter">
                <Button size="lg" className="w-full sm:w-auto">Exprimer mon vote</Button>
              </Link>
            </div>
          )}

          {hasVoted && (
            <div className="mt-12 p-6 bg-green-500/10 border border-green-500/20 rounded-2xl text-center backdrop-blur-sm flex flex-col items-center">
              <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-green-400 mb-2">Vote enregistré avec succès</h3>
              <p className="text-green-500/80 text-sm">Votre participation à cette élection a été prise en compte et inscrite de manière inaltérable.</p>
            </div>
          )}

          {!user && isActive && (
            <div className="mt-12 text-center p-8 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex flex-col items-center">
              <svg className="w-12 h-12 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-xl font-bold text-white mb-4">Authentification requise</h3>
              <p className="text-slate-400 mb-6 max-w-md">Vous devez être connecté à votre compte pour pouvoir participer à cette élection de manière sécurisée.</p>
              <Link to="/login">
                <Button variant="outline" className="w-full sm:w-auto">Se connecter pour voter</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ElectionPage