import React from 'react'
import { toast } from 'react-hot-toast'
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

const Toast = ({ t, message, type = 'success' }) => {
  const icons = {
    success: <CheckCircleIcon className="h-6 w-6 text-green-400" />,
    error: <XCircleIcon className="h-6 w-6 text-red-400" />,
    warning: <ExclamationCircleIcon className="h-6 w-6 text-yellow-400" />,
    info: <InformationCircleIcon className="h-6 w-6 text-blue-400" />
  }

  const colors = {
    success: 'bg-green-50 text-green-800',
    error: 'bg-red-50 text-red-800',
    warning: 'bg-yellow-50 text-yellow-800',
    info: 'bg-blue-50 text-blue-800'
  }

  return (
    <div
      className={`${colors[type]} flex items-center gap-3 p-4 rounded-lg shadow-lg max-w-md`}
    >
      {icons[type]}
      <p className="flex-1">{message}</p>
      <button onClick={() => toast.dismiss(t.id)} className="text-gray-500 hover:text-gray-700">
        ×
      </button>
    </div>
  )
}

export default Toast