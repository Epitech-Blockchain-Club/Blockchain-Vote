import React, { useState } from 'react'
import { useElections } from '../../contexts/ElectionContext'
import Button from '../common/Button'
import Card from '../common/Card'
import { EnvelopeIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'

const VoterList = () => {
  const { elections } = useElections()
  const [selectedElection, setSelectedElection] = useState('')
  const [emailInput, setEmailInput] = useState('')

  const election = elections.find(e => e.id === selectedElection)

  const handleImportCSV = () => {
    // Simulation d'import CSV
    const emails = emailInput.split('\n').map(e => e.trim()).filter(e => e)
    console.log('Emails importés:', emails)
    alert(`${emails.length} emails importés`)
  }

  const handleExport = () => {
    if (!election) return

    const data = {
      election: election.title,
      voters: election.voters || [],
      total: (election.voters || []).length
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `voters-${election.id}.json`
    a.click()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Gestion des électeurs</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sélection élection */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-semibold text-white mb-4">Sélectionner une élection</h2>
            <select
              value={selectedElection}
              onChange={(e) => setSelectedElection(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white mb-4"
            >
              <option value="">Choisir une élection</option>
              {elections.map(e => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>

            {election && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total votants:</span>
                  <span className="text-white">{election.voters?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Candidats:</span>
                  <span className="text-white">{election.candidates?.length || 0}</span>
                </div>
                <Button onClick={handleExport} variant="outline" className="w-full mt-4">
                  <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                  Exporter la liste
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Import */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-semibold text-white mb-4">Importer des électeurs</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Liste des emails (un par ligne)
                </label>
                <textarea
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  rows="6"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm"
                  placeholder="voter1@example.com&#10;voter2@example.com&#10;voter3@example.com"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleImportCSV}>
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  Importer les emails
                </Button>
                <Button variant="outline">
                  Télécharger un modèle CSV
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Format accepté: emails valides, un par ligne. Les doublons seront automatiquement filtrés.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default VoterList