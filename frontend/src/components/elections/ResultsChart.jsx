import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const ResultsChart = ({ sessions }) => {
  const data = (sessions || []).flatMap(session =>
    (session.candidates || []).map(c => ({
      name: c.title || c.label || `Option ${c.id}`,
      votes: c.voteCount || 0
    }))
  )

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="name"
          stroke="#94a3b8"
          fontSize={10}
          fontWeight="bold"
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          stroke="#94a3b8"
          fontSize={10}
          fontWeight="bold"
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            padding: '12px'
          }}
          itemStyle={{ color: '#0f172a', fontWeight: 'bold', fontSize: '12px' }}
          labelStyle={{ color: '#64748b', fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px', marginBottom: '4px' }}
        />
        <Bar dataKey="votes" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default ResultsChart
