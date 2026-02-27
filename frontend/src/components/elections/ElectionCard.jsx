import React from 'react'
import { Link } from 'react-router-dom'
import { CalendarIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import Card from '../common/Card'
import { ROUTES } from '../../constants/routes'
import { COUNTRY_NAMES } from '../../constants/countries'

const ElectionCard = ({ election }) => {
  const getStatusBadge = () => {
    const now = new Date()
    const start = new Date(election.startDate)
    const end = new Date(election.endDate)

    if (now < start) {
      return <span className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-500/30">À venir</span>
    } else if (now > end) {
      return <span className="px-3 py-1.5 bg-slate-700/50 text-slate-300 text-xs font-semibold rounded-full border border-slate-600/50">Terminée</span>
    } else {
      return <span className="px-3 py-1.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30 animate-pulse">En cours</span>
    }
  }

  const totalVoters = election.voters?.length || 0

  return (
    <Card hoverable className="group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent group-hover:from-indigo-400 group-hover:to-purple-400 transition-colors">{election.title}</h3>
        {getStatusBadge()}
      </div>

      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{election.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-300 text-sm">
          <CalendarIcon className="h-4 w-4 mr-2" />
          {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
        </div>

        {election.country && (
          <div className="flex items-center text-gray-300 text-sm">
            <MapPinIcon className="h-4 w-4 mr-2" />
            {COUNTRY_NAMES[election.country]}
          </div>
        )}

        <div className="flex items-center text-slate-300 text-sm bg-slate-800/50 px-3 py-1.5 rounded-lg w-fit">
          <UserGroupIcon className="h-4 w-4 mr-2 text-indigo-400" />
          {election.candidates?.length || 0} candidats · {totalVoters} votants
        </div>
      </div>

      <Link
        to={ROUTES.ELECTION(election.id)}
        className="btn-primary w-full text-center block"
      >
        Voir les détails
      </Link>
    </Card>
  )
}

export default ElectionCard