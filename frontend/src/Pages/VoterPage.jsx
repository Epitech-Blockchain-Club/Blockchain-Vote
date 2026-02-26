import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useElections } from '../contexts/ElectionContext'
import { useAuth } from '../contexts/AuthContext'
import { useBlockchain } from '../contexts/BlockchainContext'
import EmailVerification from '../components/auth/EmailVerification'
import CandidateCard from '../components/elections/CandidateCard'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
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

  // Filtrer les élections accessibles
  const availableElections = elections.filter(election => {
    const now = new Date()
    return now >= new Date(election.startDate) && now <= new Date(election.endDate)
  })

  const handleVerified = (data) => {
    setVerifiedEmail(data)
    setStep('elections')
    toast.success('Email vérifié avec succès')
  }

  const handleVoteClick = (election, candidateId) => {
    setSelectedElection(election)
    setSelectedCandidate(candidateId)
    setShowConfirmModal(true)
  }

  const confirmVote = async () => {
    setVoting(true)
    setShowConfirmModal(false)

    try {
      // Simuler une transaction blockchain
      const tx = await sendTransaction(
        '0xContractAddress',
        { electionId: selectedElection.id, candidateId: selectedCandidate }
      )

      // Enregistrer le vote
      castVote({
        electionId: selectedElection.id,
        candidateId: selectedCandidate,
        email: verifiedEmail.email,
        country: verifiedEmail.country
      })

      toast.success('Vote enregistré avec succès sur la blockchain !')
      
      // Rediriger vers la page de vérification
      navigate(`/verify/${tx.hash}`)
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
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Identification
          </h1>
          <EmailVerification onVerified={handleVerified} />
        </div>
      </div>
    )
  }

  if (step === 'elections') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Élections disponibles
          </h1>
          <p className="text-gray-400">
            Connecté en tant que : {verifiedEmail?.email}
          </p>
        </div>

        {availableElections.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-400">Aucune élection en cours pour le moment</p>
          </div>
        ) : (
          <div className="space-y-8">
            {availableElections.map(election => (
              <div key={election.id} className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {election.title}
                </h2>
                <p className="text-gray-400 mb-6">{election.description}</p>
                
                <div className="space-y-3">
                  {election.candidates.map(candidate => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onVote={() => handleVoteClick(election, candidate.id)}
                      disabled={election.voters?.includes(verifiedEmail?.email)}
                    />
                  ))}
                </div>

                {election.voters?.includes(verifiedEmail?.email) && (
                  <p className="mt-4 text-green-400 text-sm">
                    ✓ Vous avez déjà voté pour cette élection
                  </p>
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
          <div className="py-4">
            <p className="text-gray-300 mb-4">
              Vous êtes sur le point de voter pour :
            </p>
            <p className="text-white font-semibold mb-2">
              Élection : {selectedElection?.title}
            </p>
            <p className="text-white font-semibold mb-6">
              Candidat : {selectedElection?.candidates.find(c => c.id === selectedCandidate)?.name}
            </p>
            <p className="text-yellow-400 text-sm mb-6">
              ⚠️ Cette action est irréversible et sera enregistrée sur la blockchain.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={confirmVote}
                loading={voting}
                className="flex-1"
              >
                Confirmer
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

export default VoterPage