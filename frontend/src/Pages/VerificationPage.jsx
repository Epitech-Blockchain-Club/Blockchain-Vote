import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useBlockchain } from '../contexts/BlockchainContext'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import Button from '../components/common/Button'

const VerificationPage = () => {
  const { txHash } = useParams()
  const { verifyTransaction } = useBlockchain()
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState(null)

  const handleVerify = async () => {
    setVerifying(true)
    try {
      const data = await verifyTransaction(txHash)
      setResult(data)
    } catch (error) {
      setResult({ error: 'Transaction introuvable' })
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Vérification de transaction
        </h1>

        <div className="bg-gray-800 rounded-lg p-8">
          {txHash ? (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Hash de transaction
                </label>
                <code className="block p-3 bg-gray-700 rounded-lg text-primary-400 text-sm break-all">
                  {txHash}
                </code>
              </div>

              <Button
                onClick={handleVerify}
                loading={verifying}
                className="w-full mb-6"
              >
                Vérifier la transaction
              </Button>

              {result && (
                <div className={`p-4 rounded-lg ${
                  result.error ? 'bg-red-600 bg-opacity-20' : 'bg-green-600 bg-opacity-20'
                }`}>
                  {result.error ? (
                    <div className="flex items-center text-red-400">
                      <XCircleIcon className="h-6 w-6 mr-2" />
                      <p>{result.error}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center text-green-400">
                        <CheckCircleIcon className="h-6 w-6 mr-2" />
                        <span className="font-semibold">Transaction confirmée</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-gray-400">Statut:</span>
                        <span className="text-white">{result.status}</span>
                        <span className="text-gray-400">Bloc:</span>
                        <span className="text-white">#{result.blockNumber}</span>
                        <span className="text-gray-400">Date:</span>
                        <span className="text-white">
                          {new Date(result.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">
                Entrez un hash de transaction pour vérifier votre vote
              </p>
              <input
                type="text"
                placeholder="0x..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white mb-4"
              />
              <Button>Vérifier</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerificationPage