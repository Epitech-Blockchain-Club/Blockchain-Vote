import React from 'react'
import { UserIcon } from '@heroicons/react/24/outline'
import Button from '../common/Button'

const CandidateCard = ({ candidate, onVote, disabled, votes = 0, showVotes = false }) => {
  return (
    <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
          {candidate.photo ? (
            <img src={candidate.photo} alt={candidate.name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <UserIcon className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <div>
          <h4 className="font-semibold text-white">{candidate.name}</h4>
          {candidate.bio && <p className="text-sm text-gray-400">{candidate.bio}</p>}
          {showVotes && (
            <p className="text-sm text-primary-400">{votes} votes</p>
          )}
        </div>
      </div>
      {onVote && (
        <Button
          onClick={() => onVote(candidate.id)}
          disabled={disabled}
          size="sm"
        >
          Voter
        </Button>
      )}
    </div>
  )
}

export default CandidateCard