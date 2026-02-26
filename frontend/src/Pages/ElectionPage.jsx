import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useElections } from '../contexts/ElectionContext'
import { useAuth } from '../contexts/AuthContext'
import CandidateCard from '../components/elections/CandidateCard'
import CountdownTimer from '../components/common/CountdownTimer'
import Button from '../components/common/Button'
import { CalendarIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { COUNTRY_NAMES } from '../constants/countries'

const ElectionPage = () => {
  const { id } = useParams()
  const { elections } = useElections()
  const { user } = useAuth()
  const election = elections.find(e => e.id === id)

  if (!election) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl text-white mb-4">Élection introuvable</h1>
        <Link to="/" className="text-primary-400 hover:text-primary-300">
          Retour à l'accueil
        </Link>
      </div>
    )
  }

  const now = new Date()
  const isActive = now >= new Date(election.startDate) && now <= new Date(election.endDate)
  const hasVoted = election.voters?.includes(user?.email)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-primary-400 hover:text-primary-300 mb-6 inline-block">
          ← Retour
        </Link>

        <div className="bg-gray-800 rounded-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-white">{election.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm ${
              isActive ? 'bg-green-600' : 
              now < new Date(election.startDate) ? 'bg-yellow-600' : 'bg-gray-600'
            }`}>
              {isActive ? 'En cours' : 
               now < new Date(election.startDate) ? 'À venir' : 'Terminée'}
            </span>
          </div>

          <p className="text-gray-400 mb-6">{election.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-700 rounded-lg p-4">
              <CalendarIcon className="h-5 w-5 text-primary-400 mb-2" />
              <p className="text-sm text-gray-400">Début</p>
              <p className="text-white">{new Date(election.startDate).toLocaleDateString()}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <CalendarIcon className="h-5 w-5 text-primary-400 mb-2" />
              <p className="text-sm text-gray-400">Fin</p>
              <p className="text-white">{new Date(election.endDate).toLocaleDateString()}</p>
            </div>
            {election.country && (
              <div className="bg-gray-700 rounded-lg p-4">
                <MapPinIcon className="h-5 w-5 text-primary-400 mb-2" />
                <p className="text-sm text-gray-400">Pays</p>
                <p className="text-white">{COUNTRY_NAMES[election.country]}</p>
              </div>
            )}
          </div>

          {isActive && (
            <div className="mb-8">
              <CountdownTimer targetDate={election.endDate} />
            </div>
          )}

          <h2 className="text-2xl font-semibold text-white mb-4">Candidats</h2>
          
          <div className="space-y-3">
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
            <div className="mt-8 text-center">
              <Link to="/voter">
                <Button size="lg">Voter pour cette élection</Button>
              </Link>
            </div>
          )}

          {hasVoted && (
            <div className="mt-8 p-4 bg-green-600 bg-opacity-20 rounded-lg text-center">
              <p className="text-green-400">✓ Vous avez déjà voté pour cette élection</p>
            </div>
          )}

          {!user && isActive && (
            <div className="mt-8 text-center">
              <Link to="/login">
                <Button variant="outline">Connectez-vous pour voter</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ElectionPage