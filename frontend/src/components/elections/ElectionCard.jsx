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
      return <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-100 uppercase tracking-tight">À venir</span>
    } else if (now > end) {
      return <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full border border-slate-200 uppercase tracking-tight">Terminée</span>
    } else {
      return <span className="px-3 py-1 bg-primary-50 text-primary-600 text-xs font-bold rounded-full border border-primary-100 uppercase tracking-tight animate-pulse">En cours</span>
    }
  }

  const totalVoters = election.voters?.length || 0

  return (
    <Card hoverable className="group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors duration-300">{election.title}</h3>
        {getStatusBadge()}
      </div>

      <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">{election.description}</p>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-slate-600 text-sm font-medium">
          <CalendarIcon className="h-4 w-4 mr-2 text-primary-500" />
          {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
        </div>

        {election.country && (
          <div className="flex items-center text-slate-600 text-sm font-medium">
            <MapPinIcon className="h-4 w-4 mr-2 text-secondary-500" />
            {COUNTRY_NAMES[election.country]}
          </div>
        )}

        <div className="flex items-center text-slate-600 text-xs font-semibold bg-slate-50 px-3 py-2 rounded-xl w-fit border border-slate-100 italic">
          <UserGroupIcon className="h-4 w-4 mr-2 text-primary-500" />
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