import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useElections } from '../contexts/ElectionContext'
import ResultsChart from '../components/elections/ResultsChart'
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import Button from '../components/common/Button'

const ResultsPage = () => {
  const { id } = useParams()
  const { elections } = useElections()
  const [selectedElection, setSelectedElection] = useState(id || '')

  const election = elections.find(e => e.id === selectedElection)
  const now = new Date()
  const isEnded = election && new Date(election.endDate) < now

  const handleExport = () => {
    if (!election) return

    const data = {
      election: election.title,
      date: new Date().toLocaleString(),
      results: election.candidates.map(c => ({
        candidat: c.name,
        votes: election.votes?.[c.id] || 0
      }))
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resultats-${election.id}.json`
    a.click()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Résultats des élections</h1>

      {/* Sélecteur d'élection */}
      <div className="mb-8">
        <select
          value={selectedElection}
          onChange={(e) => setSelectedElection(e.target.value)}
          className="w-full md:w-96 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Sélectionnez une élection</option>
          {elections.map(e => (
            <option key={e.id} value={e.id}>
              {e.title} - {new Date(e.endDate).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {election ? (
        <div className="bg-gray-800 rounded-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{election.title}</h2>
              <p className="text-gray-400">{election.description}</p>
            </div>
            {isEnded && (
              <Button onClick={handleExport} variant="outline" size="sm">
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Exporter
              </Button>
            )}
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-400">
              Période: {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Total des votes: {Object.values(election.votes || {}).reduce((a, b) => a + b, 0)}
            </p>
          </div>

          {!isEnded && (
            <div className="mb-6 p-4 bg-yellow-600 bg-opacity-20 rounded-lg">
              <p className="text-yellow-400">
                ⚠️ Les résultats ne sont pas définitifs - l'élection est toujours en cours
              </p>
            </div>
          )}

          {/* Graphique des résultats */}
          <div className="h-96 mb-8">
            <ResultsChart election={election} />
          </div>

          {/* Tableau détaillé */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300">Candidat</th>
                  <th className="text-right py-3 px-4 text-gray-300">Voix</th>
                  <th className="text-right py-3 px-4 text-gray-300">Pourcentage</th>
                </tr>
              </thead>
              <tbody>
                {election.candidates.map(candidate => {
                  const votes = election.votes?.[candidate.id] || 0
                  const total = Object.values(election.votes || {}).reduce((a, b) => a + b, 0)
                  const percentage = total > 0 ? ((votes / total) * 100).toFixed(1) : 0

                  return (
                    <tr key={candidate.id} className="border-b border-gray-700">
                      <td className="py-3 px-4 text-white">{candidate.name}</td>
                      <td className="text-right py-3 px-4 text-white">{votes}</td>
                      <td className="text-right py-3 px-4 text-white">{percentage}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Lien de vérification blockchain */}
          <div className="mt-8 p-4 bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Vérification blockchain</p>
            <code className="text-xs text-primary-400 break-all">
              Contrat: 0x742d35Cc6634C0532925a3b844BcAc4e4f3e6e5a
            </code>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <p className="text-gray-400">Sélectionnez une élection pour voir les résultats</p>
        </div>
      )}
    </div>
  )
}

export default ResultsPage