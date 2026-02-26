import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const ResultsChart = ({ election }) => {
  const data = election.candidates.map(candidate => ({
    name: candidate.name,
    votes: election.votes?.[candidate.id] || 0
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="name" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
          labelStyle={{ color: '#fff' }}
        />
        <Bar dataKey="votes" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default ResultsChart
