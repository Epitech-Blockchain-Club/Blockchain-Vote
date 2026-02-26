import React, { useState } from 'react'
import { useElections } from '../../contexts/ElectionContext'
import Card from '../common/Card'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer 
} from 'recharts'

const Statistics = () => {
  const { elections } = useElections()
  const [selectedElection, setSelectedElection] = useState('')

  const election = elections.find(e => e.id === selectedElection)

  // Statistiques globales
  const globalStats = {
    totalElections: elections.length,
    totalVotes: elections.reduce((acc, e) => acc + (e.voters?.length || 0), 0),
    activeElections: elections.filter(e => {
      const now = new Date()
      return now >= new Date(e.startDate) && now <= new Date(e.endDate)
    }).length,
    avgParticipation: elections.length > 0 
      ? (elections.reduce((acc, e) => acc + (e.voters?.length || 0), 0) / elections.length).toFixed(1)
      : 0
  }

  // Données pour les graphiques par pays
  const votesByCountry = elections
    .filter(e => e.country)
    .reduce((acc, e) => {
      const country = e.country
      acc[country] = (acc[country] || 0) + (e.voters?.length || 0)
      return acc
    }, {})

  const countryData = Object.entries(votesByCountry).map(([country, votes]) => ({
    name: country,
    votes
  }))

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Statistiques</h1>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <p className="text-3xl font-bold text-white">{globalStats.totalElections}</p>
          <p className="text-gray-400">Élections totales</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-white">{globalStats.totalVotes}</p>
          <p className="text-gray-400">Votes exprimés</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-white">{globalStats.activeElections}</p>
          <p className="text-gray-400">En cours</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-white">{globalStats.avgParticipation}</p>
          <p className="text-gray-400">Moyenne votes/élection</p>
        </Card>
      </div>

      {/* Sélecteur d'élection pour détails */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Détails par élection</h2>
        <select
          value={selectedElection}
          onChange={(e) => setSelectedElection(e.target.value)}
          className="w-full md:w-96 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="">Sélectionnez une élection</option>
          {elections.map(e => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>

        {election && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Résultats</h3>
              <div className="space-y-2">
                {election.candidates.map(candidate => (
                  <div key={candidate.id} className="flex justify-between">
                    <span className="text-gray-400">{candidate.name}</span>
                    <span className="text-white font-semibold">
                      {election.votes?.[candidate.id] || 0} votes
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Informations</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Participation:</span>
                  <span className="text-white">{election.voters?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date début:</span>
                  <span className="text-white">{new Date(election.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date fin:</span>
                  <span className="text-white">{new Date(election.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold text-white mb-4">Votes par pays</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="votes" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-white mb-4">Répartition des votes</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="votes"
                >
                  {countryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Statistics