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
    candidates: existingElection?.candidates || [{ id: Date.now(), name: '', bio: '' }],
    moderators: existingElection?.moderators || [{ id: Date.now(), address: '', role: 'Modérateur' }]
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

  const handleModeratorChange = (index, field, value) => {
    const updatedModerators = [...formData.moderators]
    updatedModerators[index] = { ...updatedModerators[index], [field]: value }
    setFormData(prev => ({ ...prev, moderators: updatedModerators }))
  }

  const addModerator = () => {
    setFormData(prev => ({
      ...prev,
      moderators: [...prev.moderators, { id: Date.now(), address: '', role: 'Modérateur' }]
    }))
  }

  const removeModerator = (index) => {
    if (formData.moderators.length > 1) {
      setFormData(prev => ({
        ...prev,
        moderators: prev.moderators.filter((_, i) => i !== index)
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

        {/* Section Modérateurs */}
        <Card className="mb-6 border-l-4 border-indigo-500">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Modérateurs de l'Élection</h2>
              <p className="text-sm text-gray-400 mt-1">
                Ils pourront surveiller le bon déroulement, mais ne pourront en aucun cas modifier les votes (Inaltérabilité Blockchain).
              </p>
            </div>
            <Button type="button" onClick={addModerator} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <PlusIcon className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </div>

          <div className="space-y-4">
            {formData.moderators.map((moderator, index) => (
              <div key={moderator.id} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={moderator.address}
                    onChange={(e) => handleModeratorChange(index, 'address', e.target.value)}
                    placeholder="Adresse Ethereum (0x...)"
                    required
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    value={moderator.role}
                    onChange={(e) => handleModeratorChange(index, 'role', e.target.value)}
                    placeholder="Rôle (ex: Modérateur, Superviseur)"
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                {formData.moderators.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeModerator(index)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
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

        <div className="mb-6 p-4 bg-gray-800/50 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-full">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-green-400">Garantie d'Inaltérabilité (Blockchain)</h3>
              <p className="text-xs text-gray-400 mt-1">
                En tant que superadmin, un Smart Contract scelle définitivement les paramètres de cette élection dès sa création. Il vous est impossible, ainsi qu'à quiconque, de truquer ou d'altérer les résultats des votes une fois émis.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20">
            {existingElection ? 'Mettre à jour' : 'Créer'} l'élection
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => navigate('/admin')} className="w-full">
            Annuler
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateElectionForm