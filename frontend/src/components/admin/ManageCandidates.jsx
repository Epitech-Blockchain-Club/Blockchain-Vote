import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useElections } from '../../contexts/ElectionContext'
import Button from '../common/Button'
import Card from '../common/Card'
import { PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'

const ManageCandidates = () => {
  const { id } = useParams()
  const { elections, updateElection } = useElections()
  const navigate = useNavigate()
  
  const election = elections.find(e => e.id === id)
  const [candidates, setCandidates] = useState(election?.candidates || [])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', bio: '' })

  if (!election) {
    return <div>Élection introuvable</div>
  }

  const handleMoveUp = (index) => {
    if (index > 0) {
      const newCandidates = [...candidates]
      ;[newCandidates[index - 1], newCandidates[index]] = [newCandidates[index], newCandidates[index - 1]]
      setCandidates(newCandidates)
    }
  }

  const handleMoveDown = (index) => {
    if (index < candidates.length - 1) {
      const newCandidates = [...candidates]
      ;[newCandidates[index], newCandidates[index + 1]] = [newCandidates[index + 1], newCandidates[index]]
      setCandidates(newCandidates)
    }
  }

  const handleDelete = (index) => {
    if (window.confirm('Supprimer ce candidat ?')) {
      setCandidates(candidates.filter((_, i) => i !== index))
    }
  }

  const handleEdit = (candidate) => {
    setEditingId(candidate.id)
    setEditForm({ name: candidate.name, bio: candidate.bio || '' })
  }

  const handleSaveEdit = (id) => {
    setCandidates(candidates.map(c => 
      c.id === id ? { ...c, ...editForm } : c
    ))
    setEditingId(null)
  }

  const handleSave = () => {
    updateElection(id, { ...election, candidates })
    navigate('/admin')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Gestion des candidats</h1>
      <p className="text-gray-400 mb-8">{election.title}</p>

      <Card className="mb-6">
        <div className="space-y-4">
          {candidates.map((candidate, index) => (
            <div key={candidate.id} className="bg-gray-700 rounded-lg p-4">
              {editingId === candidate.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                    placeholder="Nom du candidat"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                    placeholder="Biographie"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSaveEdit(candidate.id)}>
                      Sauvegarder
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{candidate.name}</h3>
                    {candidate.bio && (
                      <p className="text-sm text-gray-400">{candidate.bio}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      <ArrowUpIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === candidates.length - 1}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      <ArrowDownIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(candidate)}
                      className="p-1 text-blue-400 hover:text-blue-300"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleSave} size="lg">
          Sauvegarder les modifications
        </Button>
        <Button variant="outline" size="lg" onClick={() => navigate('/admin')}>
          Annuler
        </Button>
      </div>
    </div>
  )
}

export default ManageCandidates