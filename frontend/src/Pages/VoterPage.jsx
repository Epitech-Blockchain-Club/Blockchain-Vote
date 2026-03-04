import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useElections } from '../contexts/ElectionContext'
import { useAuth } from '../contexts/AuthContext'
import { useBlockchain } from '../contexts/BlockchainContext'
import EmailVerification from '../components/auth/EmailVerification'
import CandidateCard from '../components/elections/CandidateCard'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import { ShieldCheckIcon, FunnelIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const VoterPage = () => {
  const [step, setStep] = useState('verify') // verify, elections, vote
  const [verifiedEmail, setVerifiedEmail] = useState(null)
  const [selectedElection, setSelectedElection] = useState(null)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [voting, setVoting] = useState(false)

  const { elections, castVote } = useElections()
  const { user } = useAuth()
  const { sendTransaction } = useBlockchain()
  const navigate = useNavigate()

  // Filtrer les élections accessibles (ayant au moins une session validée)
  const availableElections = elections.filter(election => {
    const now = new Date()
    const isToday = now >= new Date(election.startDate) && now <= new Date(election.endDate)
    return isToday && election.status === 'active'
  })

  const handleVerified = (data) => {
    setVerifiedEmail(data)
    setStep('elections')
    toast.success('Email vérifié avec succès')
  }

  const handleVoteClick = (election, session, candidateId) => {
    setSelectedElection({ ...election, currentSession: session })
    setSelectedCandidate(candidateId)
    setShowConfirmModal(true)
  }

  const confirmVote = async () => {
    setVoting(true)
    setShowConfirmModal(false)

    try {
      // Utiliser l'adresse de la session pour le vote
      const sessionAddress = selectedElection.currentSession.address

      // Enregistrer le vote via l'API (qui gère la transaction blockchain)
      const success = await castVote({
        electionId: sessionAddress,
        candidateId: selectedCandidate,
        email: verifiedEmail.email,
        country: verifiedEmail.country
      })

      if (success) {
        toast.success('Vote enregistré avec succès !')
        // Optionnel: rediriger vers une page de confirmation ou rafraîchir
      }
    } catch (error) {
      toast.error('Erreur lors du vote')
    } finally {
      setVoting(false)
      setSelectedElection(null)
      setSelectedCandidate(null)
    }
  }

  if (step === 'verify') {
    return (
      <div className="container mx-auto px-4 py-12 relative">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Vote sécurisé
            </h1>
            <p className="text-slate-500 font-medium max-w-md mx-auto">
              Identifiez-vous pour accéder à vos scrutins. Votre vote est protégé par la blockchain.
            </p>
          </div>
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            <EmailVerification onVerified={handleVerified} />
          </div>
        </div>
      </div>
    )
  }

  if (step === 'elections') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-6 bg-slate-50 p-8 rounded-3xl border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
              Scrutins en cours
            </h1>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 bg-primary-500 rounded-full animate-pulse"></span>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest leading-none">
                Identifié : <span className="text-primary-600 italic">{verifiedEmail?.email}</span>
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setStep('verify')} className="border-slate-200 text-slate-500">Changer d'email</Button>
        </div>

        {availableElections.length === 0 ? (
          <div className="text-center py-24 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m0 0l2 2 2-2M8 21l4-4 4 4" />
              </svg>
            </div>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em]">Aucun scrutin validé et ouvert pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {availableElections.map(election => (
              <div key={election.id} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-100/50 hover:border-primary-100 transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {election.title}
                  </h2>
                </div>
                <p className="text-slate-500 mb-8 font-medium leading-relaxed line-clamp-2">{election.description}</p>

                <div className="space-y-8">
                  {election.sessions?.filter(s => s.isValidated).map((session, sIdx) => (
                    <div key={sIdx} className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Session: {session.title}</p>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg border border-emerald-100 uppercase tracking-wider">Validé</span>
                      </div>
                      <div className="space-y-3">
                        {session.options?.map((candidate, cIdx) => (
                          <CandidateCard
                            key={cIdx}
                            candidate={candidate}
                            onVote={() => handleVoteClick(election, session, cIdx)}
                            disabled={election.voters?.includes(verifiedEmail?.email)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {election.voters?.includes(verifiedEmail?.email) && (
                  <div className="mt-6 flex items-center p-4 bg-primary-50 rounded-2xl border border-primary-100">
                    <ShieldCheckIcon className="h-5 w-5 text-primary-600 mr-2" />
                    <p className="text-primary-700 text-xs font-black uppercase tracking-wider leading-none">
                      ✓ Vote déjà enregistré
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirmer votre vote"
        >
          <div className="py-2">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
              <div className="flex items-center text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                <FunnelIcon className="h-3 w-3 mr-2" /> Détails du scrutin
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Élection</p>
                  <p className="text-slate-900 font-bold">{selectedElection?.title}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Votre choix</p>
                  <p className="text-primary-600 font-black text-xl">
                    {selectedElection?.candidates.find(c => c.id === selectedCandidate)?.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex items-start space-x-3 mb-8">
              <ExclamationTriangleIcon className="h-6 w-6 text-amber-500 flex-shrink-0" />
              <p className="text-amber-700 text-sm font-medium leading-relaxed">
                Cette action est irréversible. Une fois confirmé, votre vote sera crypté et enregistré définitivement sur le registre décentralisé de la blockchain.
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 border-slate-200"
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={confirmVote}
                loading={voting}
                className="flex-1 shadow-lg shadow-primary-500/20"
              >
                Confirmer mon vote
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

export default VoterPage