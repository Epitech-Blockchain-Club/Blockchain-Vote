import React, { useState } from 'react'
import Button from '../common/Button'
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const EmailVerification = ({ onVerified }) => {
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)

  const handleVerify = async () => {
    setVerifying(true)
    // Simuler une vérification
    setTimeout(() => {
      setVerified(true)
      setVerifying(false)
      onVerified?.({ email, country })
    }, 1500)
  }

  if (verified) {
    return (
      <div className="text-center py-4">
        <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
        <p className="text-green-400">Email vérifié avec succès !</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Vérification de l'email</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="votre@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Pays de résidence
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Sélectionnez votre pays</option>
            <option value="FR">France</option>
            <option value="BJ">Bénin</option>
            <option value="SN">Sénégal</option>
            <option value="CI">Côte d'Ivoire</option>
          </select>
        </div>

        <Button
          onClick={handleVerify}
          loading={verifying}
          disabled={!email || !country}
          className="w-full"
        >
          Vérifier mon email
        </Button>
      </div>
    </div>
  )
}

export default EmailVerification