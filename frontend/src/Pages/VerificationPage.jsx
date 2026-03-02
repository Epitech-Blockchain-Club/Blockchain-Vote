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
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-2xl mb-6 shadow-lg shadow-primary-500/10">
            <CheckCircleIcon className="h-10 w-10 text-primary-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
            Transparence Blockchain
          </h1>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            Vérifiez l'intégrité et l'authenticité de votre vote directement sur le registre immuable.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
          {txHash ? (
            <div>
              <div className="mb-8">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">
                  Identifiant de transaction (TX Hash)
                </label>
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl break-all font-mono text-xs text-primary-600 shadow-inner">
                  {txHash}
                </div>
              </div>

              <Button
                onClick={handleVerify}
                loading={verifying}
                className="w-full h-14 shadow-lg shadow-primary-500/20 font-black tracking-tight mb-10"
              >
                Lancer la vérification cryptographique
              </Button>

              {result && (
                <div className={`p-8 rounded-3xl border ${result.error ? 'bg-red-50 border-red-100' : 'bg-primary-50 border-primary-100'
                  }`}>
                  {result.error ? (
                    <div className="flex items-center text-red-700">
                      <XCircleIcon className="h-6 w-6 mr-3" />
                      <p className="font-bold">{result.error}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center text-primary-700">
                        <CheckCircleIcon className="h-6 w-6 mr-3" />
                        <span className="text-xl font-black">Transaction Scellée</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-2xl border border-primary-100/50">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confirmation</p>
                          <p className="text-slate-900 font-bold">{result.status}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-primary-100/50">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Index du Bloc</p>
                          <div className="flex items-center gap-2">
                            <span className="text-primary-600 font-black">#{result.blockNumber}</span>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-primary-100/50 sm:col-span-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Horodatage immuable</p>
                          <p className="text-slate-900 font-bold">
                            {new Date(result.timestamp).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'medium' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 font-medium mb-8">
                Vous n'avez pas de transaction en cours ? <br />
                Entrez un hash manuellement pour auditer le scrutin.
              </p>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Collez ici le TX Hash (0x...)"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all font-mono text-sm"
                />
                <Button className="h-14 font-black tracking-tight shadow-lg shadow-primary-500/10">Vérifier maintenant</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerificationPage