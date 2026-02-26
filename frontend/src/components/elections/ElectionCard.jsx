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
      return <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">À venir</span>
    } else if (now > end) {
      return <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded-full">Terminée</span>
    } else {
      return <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">En cours</span>
    }
  }

  const totalVotes = Object.values(election.votes || {}).reduce((a, b) => a + b, 0)

  return (
    <Card hoverable>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white">{election.title}</h3>
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
        
        <div className="flex items-center text-gray-300 text-sm">
          <UserGroupIcon className="h-4 w-4 mr-2" />
          {election.candidates?.length || 0} candidats · {totalVotes} votes
        </div>
      </div>
      
      <Link
        to={ROUTES.ELECTION(election.id)}
        className="btn-primary w-full text-center"
      >
        Voir les détails
      </Link>
    </Card>
  )
}

export default ElectionCard