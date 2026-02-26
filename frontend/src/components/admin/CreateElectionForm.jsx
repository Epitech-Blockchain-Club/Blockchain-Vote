import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useElections } from '../../contexts/ElectionContext'
import Button from '../common/Button'
import Card from '../common/Card'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { COUNTRIES } from '../../constants/countries'

const CreateElectionForm = () => {
  const { id } = useParams()
  const { elections, addElection, updateElection } = useElections()
  const navigate = useNavigate()
  
  const existingElection = id ? elections.find(e => e.id === id) : null

  const [formData, setFormData] = useState({
    title: existingElection?.title || '',
    description: existingElection?.description || '',
    type: existingElection?.type || 'local',
    country: existingElection?.country || '',
    startDate: existingElection?.startDate?.split('T')[0] || '',
    endDate: existingElection?.endDate?.split('T')[0] || '',
    candidates: existingElection?.candidates || [{ id: Date.now(), name: '', bio: '' }]
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCandidateChange = (index, field, value) => {
    const updatedCandidates = [...formData.candidates]
    updatedCandidates[index] = { ...updatedCandidates[index], [field]: value }
    setFormData(prev => ({ ...prev, candidates: updatedCandidates }))
  }

  const addCandidate = () => {
    setFormData(prev => ({
      ...prev,
      candidates: [...prev.candidates, { id: Date.now(), name: '', bio: '' }]
    }))
  }

  const removeCandidate = (index) => {
    if (formData.candidates.length > 1) {
      setFormData(prev => ({
        ...prev,
        candidates: prev.candidates.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const electionData = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      votes: existingElection?.votes || {},
      voters: existingElection?.voters || []
    }

    if (existingElection) {
      updateElection(id, electionData)
    } else {
      addElection(electionData)
    }

    navigate('/admin')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">
        {existingElection ? 'Modifier' : 'Créer'} une élection
      </h1>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Informations générales</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Titre de l'élection
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Ex: Élection du Bureau des Alumni"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Décrivez l'élection..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Type d'élection
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="local">Locale</option>
                  <option value="international">Internationale</option>
                </select>
              </div>

              {formData.type === 'local' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Pays
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required={formData.type === 'local'}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">Sélectionnez un pays</option>
                    {COUNTRIES.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  min={formData.startDate}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Candidats</h2>
            <Button type="button" onClick={addCandidate} size="sm">
              <PlusIcon className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </div>

          <div className="space-y-4">
            {formData.candidates.map((candidate, index) => (
              <div key={candidate.id} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={candidate.name}
                    onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                    placeholder="Nom du candidat"
                    required
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    value={candidate.bio}
                    onChange={(e) => handleCandidateChange(index, 'bio', e.target.value)}
                    placeholder="Biographie (optionnel)"
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                {formData.candidates.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCandidate(index)}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" size="lg">
            {existingElection ? 'Mettre à jour' : 'Créer'} l'élection
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => navigate('/admin')}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateElectionForm