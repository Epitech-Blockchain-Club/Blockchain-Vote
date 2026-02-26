import React from 'react'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

const TransactionStatus = ({ status, hash, onView }) => {
  const statusConfig = {
    pending: {
      icon: <ClockIcon className="h-5 w-5 text-yellow-400" />,
      text: 'En attente de confirmation',
      color: 'text-yellow-400'
    },
    success: {
      icon: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
      text: 'Transaction confirmée',
      color: 'text-green-400'
    },
    failed: {
      icon: <XCircleIcon className="h-5 w-5 text-red-400" />,
      text: 'Transaction échouée',
      color: 'text-red-400'
    }
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {config.icon}
          <span className={`text-sm font-medium ${config.color}`}>
            {config.text}
          </span>
        </div>
        {hash && (
          <button
            onClick={() => onView?.(hash)}
            className="text-xs text-primary-400 hover:text-primary-300"
          >
            Voir détails
          </button>
        )}
      </div>
      {hash && (
        <div className="mt-2">
          <p className="text-xs text-gray-400 mb-1">Hash de transaction</p>
          <code className="text-xs text-primary-400 break-all bg-gray-800 p-2 rounded block">
            {hash}
          </code>
        </div>
      )}
    </div>
  )
}

export default TransactionStatus