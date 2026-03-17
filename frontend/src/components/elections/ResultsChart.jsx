import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16']

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.04) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const ResultsChart = ({ sessions }) => {
  const [chartType, setChartType] = useState('bar')

  const data = (sessions || []).flatMap(session =>
    (session.candidates || []).map(c => ({
      name: c.title || c.label || `Option ${c.id}`,
      votes: c.voteCount || 0
    }))
  )

  if (!data.length) return null

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex justify-end">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${chartType === 'bar' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Barres
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${chartType === 'pie' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Camembert
          </button>
        </div>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                itemStyle={{ color: '#0f172a', fontWeight: 'bold', fontSize: '12px' }}
                labelStyle={{ color: '#64748b', fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px', marginBottom: '4px' }}
              />
              <Bar dataKey="votes" radius={[4, 4, 0, 0]} barSize={40}>
                {data.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie data={data} dataKey="votes" nameKey="name" cx="50%" cy="50%" outerRadius="75%" labelLine={false} label={CustomPieLabel}>
                {data.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                itemStyle={{ color: '#0f172a', fontWeight: 'bold', fontSize: '12px' }}
              />
              <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: 11, fontWeight: 'bold', color: '#475569' }}>{value}</span>} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ResultsChart
