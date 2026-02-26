import React from 'react'
import { CheckBadgeIcon } from '@heroicons/react/24/outline'

const VerificationBadge = ({ verified, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
    >
      {verified ? (
        <>
          <CheckBadgeIcon className="h-4 w-4 text-green-400" />
          <span className="text-xs text-green-400">Vérifié</span>
        </>
      ) : (
        <>
          <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
          <span className="text-xs text-yellow-400">En attente</span>
        </>
      )}
    </button>
  )
}

export default VerificationBadge