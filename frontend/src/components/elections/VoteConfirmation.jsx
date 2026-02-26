import React from 'react'

export default function VoteConfirmation({ tx }) {
  return (
    <div className="p-4 bg-green-800 text-white rounded">
      Vote enregistré — tx: <code>{tx}</code>
    </div>
  )
}
