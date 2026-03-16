import React from 'react'
import { UserIcon } from '@heroicons/react/24/outline'
import Button from '../common/Button'

const CandidateCard = ({ candidate, onVote, disabled, votes = 0, showVotes = false }) => {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100 hover:border-primary-100 transition-colors group">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden transition-transform group-hover:scale-105">
          {candidate.photo ? (
            <img src={candidate.photo} alt={candidate.name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <UserIcon className="h-6 w-6 text-slate-400" />
          )}
        </div>
        <div>
          <h4 className="font-bold text-slate-900">{candidate.name}</h4>
          {candidate.bio && <p className="text-sm text-slate-500">{candidate.bio}</p>}
          {showVotes && (
            <p className="text-sm font-bold text-primary-600">{votes} votes</p>
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