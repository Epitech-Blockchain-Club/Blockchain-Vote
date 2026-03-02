import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  XMarkIcon,
  PlusIcon,
  ShieldCheckIcon,
  DocumentArrowUpIcon,
  QrCodeIcon,
  LinkIcon,
  CheckCircleIcon,
  CameraIcon
} from '@heroicons/react/24/outline'
import Button from '../common/Button'
import Card from '../common/Card'
import { useElections } from '../../contexts/ElectionContext'
import { COUNTRIES } from '../../constants/countries'

const CreateElectionForm = () => {
  const navigate = useNavigate()
  const { addElection } = useElections()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scope: 'international',
    country: '',
    timingMode: 'manual', // 'manual' | 'scheduled'
    startDate: '',
    endDate: '',
    moderators: [''], // Array of emails
    voterCount: 0,
    votersFile: null,
    parts: [
      { id: Date.now(), title: '', description: '', imageUrl: '' }
    ]
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // --- Moderators ---
  const handleModeratorChange = (index, value) => {
    const newMods = [...formData.moderators]
    newMods[index] = value
    setFormData(prev => ({ ...prev, moderators: newMods }))
  }
  const addModerator = () => setFormData(prev => ({ ...prev, moderators: [...prev.moderators, ''] }))
  const removeModerator = (index) => {
    if (formData.moderators.length > 1) {
      setFormData(prev => ({ ...prev, moderators: prev.moderators.filter((_, i) => i !== index) }))
    }
  }

  // --- Voting Parts ---
  const handlePartChange = (index, field, value) => {
    const newParts = [...formData.parts]
    newParts[index] = { ...newParts[index], [field]: value }
    setFormData(prev => ({ ...prev, parts: newParts }))
  }

  const handlePartPhoto = (index, e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image trop volumineuse (> 2Mo)')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        handlePartChange(index, 'imageUrl', reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  const addPart = () => setFormData(prev => ({
    ...prev, parts: [...prev.parts, { id: Date.now(), title: '', description: '', imageUrl: '' }]
  }))
  const removePart = (index) => {
    if (formData.parts.length > 1) {
      setFormData(prev => ({ ...prev, parts: prev.parts.filter((_, i) => i !== index) }))
    }
  }

  // --- Submit ---
  const handleSubmit = (e) => {
    e.preventDefault()

    // Process creation (mock)
    const newElectionId = `elec_${Date.now()}`

    // Simulate API call and QR Generation
    setTimeout(() => {
      setGeneratedLink(`https://vote.epitech.eu/election/${newElectionId}`)
      setIsSubmitted(true)
    }, 1000)
  }

  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <Card className="text-center p-12 bg-white shadow-2xl border-slate-100 rounded-[40px]">
          <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircleIcon className="w-12 h-12 text-primary-600" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">VoteChain : Scrutin Configuré</h2>
          <p className="text-slate-500 font-medium mb-10 max-w-xl mx-auto">
            Votre session de vote est maintenant prête. Les modérateurs ont été notifiés pour validation.
            Une fois approuvé, le lien ci-dessous sera actif pour tous les électeurs.
          </p>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 mb-10">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Liens d'accès (Votants)</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 w-full">
                <LinkIcon className="w-6 h-6 text-slate-400" />
                <input type="text" readOnly value={generatedLink} className="flex-1 bg-transparent border-none text-slate-600 font-medium focus:ring-0 text-sm" />
                <Button size="sm" variant="outline">Copier</Button>
              </div>
              <div className="w-32 h-32 bg-white border-4 border-slate-50 rounded-3xl flex flex-col items-center justify-center p-2 shadow-xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generatedLink)}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Scannez pour accéder au vote</p>
          </div>

          <Button size="lg" onClick={() => navigate('/admin')} className="h-14 px-12 rounded-2xl">
            Retour au Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="flex items-center space-x-6 mb-10">
        <Link to="/admin" className="p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-colors shadow-sm">
          <XMarkIcon className="h-6 w-6 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Nouveau Scrutin</h1>
          <p className="text-slate-500 font-medium">Définissez les paramètres de gouvernance (Modérateurs, Votants, Options).</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* 1. Base Info */}
        <Card className="bg-white border-slate-100 shadow-sm p-8">
          <h2 className="text-xs font-black text-primary-600 uppercase tracking-[0.2em] mb-6">1. Informations Essentielles</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Titre du scrutin</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium text-slate-900" placeholder="Ex: Élection BDE 2024" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Description</label>
              <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium text-slate-900" placeholder="Contexte et objectifs du vote..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Portée / Scope</label>
              <div className="flex gap-4">
                <label className={`flex-1 p-4 border rounded-2xl cursor-pointer transition-all ${formData.scope === 'national' ? 'bg-primary-50 border-primary-500' : 'bg-slate-50 border-slate-200'}`}>
                  <input type="radio" name="scope" value="national" checked={formData.scope === 'national'} onChange={handleChange} className="hidden" />
                  <span className={`font-bold ${formData.scope === 'national' ? 'text-primary-700' : 'text-slate-600'}`}>National</span>
                </label>
                <label className={`flex-1 p-4 border rounded-2xl cursor-pointer transition-all ${formData.scope === 'international' ? 'bg-primary-50 border-primary-500' : 'bg-slate-50 border-slate-200'}`}>
                  <input type="radio" name="scope" value="international" checked={formData.scope === 'international'} onChange={handleChange} className="hidden" />
                  <span className={`font-bold ${formData.scope === 'international' ? 'text-primary-700' : 'text-slate-600'}`}>International</span>
                </label>
              </div>
            </div>

            {formData.scope === 'national' && (
              <div className="animate-fade-in">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Choisir le pays concerné</label>
                <select
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium text-slate-900 appearance-none"
                >
                  <option value="">Sélectionnez un pays...</option>
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Card>

        {/* 2. Timing */}
        <Card className="bg-white border-slate-100 shadow-sm p-8">
          <h2 className="text-xs font-black text-primary-600 uppercase tracking-[0.2em] mb-6">2. Pilotage Temporel</h2>
          <div className="space-y-5">
            <div className="flex gap-4 mb-4">
              <label className={`flex-1 p-4 border rounded-2xl cursor-pointer transition-all ${formData.timingMode === 'manual' ? 'bg-primary-50 border-primary-500' : 'bg-slate-50 border-slate-200'}`}>
                <input type="radio" name="timingMode" value="manual" checked={formData.timingMode === 'manual'} onChange={handleChange} className="hidden" />
                <span className={`font-bold block ${formData.timingMode === 'manual' ? 'text-primary-700' : 'text-slate-600'}`}>Manuel</span>
                <span className="text-xs text-slate-500 font-medium">Ouverture et fermeture par le panneau admin.</span>
              </label>
              <label className={`flex-1 p-4 border rounded-2xl cursor-pointer transition-all ${formData.timingMode === 'scheduled' ? 'bg-primary-50 border-primary-500' : 'bg-slate-50 border-slate-200'}`}>
                <input type="radio" name="timingMode" value="scheduled" checked={formData.timingMode === 'scheduled'} onChange={handleChange} className="hidden" />
                <span className={`font-bold block ${formData.timingMode === 'scheduled' ? 'text-primary-700' : 'text-slate-600'}`}>Programmé</span>
                <span className="text-xs text-slate-500 font-medium">Dates définies à l'avance.</span>
              </label>
            </div>
            {formData.timingMode === 'scheduled' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Début</label>
                  <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Fin</label>
                  <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium" />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 3. Moderators */}
        <Card className="bg-white border-slate-100 shadow-sm p-8 border-l-4 border-l-secondary-500">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xs font-black text-secondary-600 uppercase tracking-[0.2em] mb-2">3. Modérateurs (Validateurs)</h2>
              <p className="text-sm text-slate-500 font-medium max-w-xl">
                Ces emails recevront les paramètres du vote. Un consensus de <span className="font-black text-secondary-600">100%</span> est OBLIGATOIRE pour valider et ouvrir le scrutin. Un seul refus annule tout.
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" className="border-secondary-200 text-secondary-600 hover:bg-secondary-50">
                <DocumentArrowUpIcon className="w-4 h-4 mr-2" /> CSV
              </Button>
              <Button type="button" onClick={addModerator} size="sm" variant="outline" className="border-secondary-200 text-secondary-600 hover:bg-secondary-50">
                <PlusIcon className="w-4 h-4 mr-2" /> Ajouter
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {formData.moderators.map((email, index) => (
              <div key={index} className="flex gap-2">
                <input type="email" required placeholder="Email institutionnel du modérateur" value={email} onChange={(e) => handleModeratorChange(index, e.target.value)} className="flex-1 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-secondary-500 font-medium" />
                {formData.moderators.length > 1 && (
                  <button type="button" onClick={() => removeModerator(index)} className="p-3 text-red-400 hover:text-red-500 bg-slate-50 rounded-2xl border border-slate-100"><XMarkIcon className="w-6 h-6" /></button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* 4. Voters */}
        <Card className="bg-white border-slate-100 shadow-sm p-8">
          <h2 className="text-xs font-black text-primary-600 uppercase tracking-[0.2em] mb-6">4. Gestion des Électeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Taille du collège électoral</label>
              <input type="number" name="voterCount" placeholder="0" min="0" value={formData.voterCount} onChange={handleChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-black text-2xl text-slate-900" />
              <p className="text-xs text-slate-500 font-medium mt-2">Nombre total estimé pour calculer les taux de participation.</p>
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Autorisation des Votants</label>

              <div className="grid grid-cols-1 gap-4">
                <div className="h-24 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 p-4 hover:bg-primary-50 transition-colors cursor-pointer group">
                  <DocumentArrowUpIcon className="w-8 h-8 text-slate-400 group-hover:text-primary-600 mb-2 transition-colors" />
                  <span className="text-[10px] font-bold text-slate-600 group-hover:text-primary-600 transition-colors uppercase">CSV des votants</span>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-400">
                    <span className="bg-white px-2">Ou Saisie Directe</span>
                  </div>
                </div>

                <textarea
                  rows="3"
                  placeholder="Collez ici la liste des emails séparés par des virgules ou retours à la ligne..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-primary-500"
                ></textarea>
              </div>
            </div>
          </div>
        </Card>

        {/* 5. Voting Parts (Candidates) */}
        <Card className="bg-white border-slate-100 shadow-sm p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xs font-black text-primary-600 uppercase tracking-[0.2em] mb-2">5. Options de Vote (Parts)</h2>
              <p className="text-sm text-slate-500 font-medium">Définissez les choix possibles pour les électeurs.</p>
            </div>
            <Button type="button" onClick={addPart} size="sm" variant="outline" className="border-primary-200 text-primary-600 hover:bg-primary-50">
              <PlusIcon className="w-4 h-4 mr-2" /> Ajouter une option
            </Button>
          </div>

          <div className="space-y-6">
            {formData.parts.map((part, index) => (
              <div key={part.id} className="p-6 border border-slate-100 bg-slate-50/50 rounded-3xl relative">
                {formData.parts.length > 1 && (
                  <button type="button" onClick={() => removePart(index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><XMarkIcon className="w-6 h-6" /></button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Titre de l'option / Liste</label>
                      <input type="text" required value={part.title} onChange={(e) => handlePartChange(index, 'title', e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold" />
                    </div>
                    <div className="relative group">
                      <div className="h-12 w-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                        {part.imageUrl ? (
                          <img src={part.imageUrl} alt="Part Preview" className="h-full w-full object-cover" />
                        ) : (
                          <CameraIcon className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      <label className="absolute -bottom-2 -right-2 h-6 w-6 bg-primary-600 rounded-lg flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-700 transition-colors">
                        <PlusIcon className="w-4 h-4 text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePartPhoto(index, e)} />
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Description & Membres (Optionnel)</label>
                  <textarea rows="2" value={part.description} onChange={(e) => handlePartChange(index, 'description', e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl" placeholder="Noms des membres, programme..." />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Security Alert & Submit */}
        <div className="p-6 bg-slate-900 rounded-[32px] flex flex-col md:flex-row items-center gap-6 justify-between shadow-2xl">
          <div className="flex items-center gap-4">
            <ShieldCheckIcon className="w-12 h-12 text-primary-500 flex-shrink-0" />
            <div>
              <h4 className="text-white font-black text-lg tracking-tight">Hachage Blockchain</h4>
              <p className="text-slate-400 text-sm font-medium">Une fois soumis, les <b>modérateurs</b> doivent approuver. Le contrat intelligent sera alors scellé.</p>
            </div>
          </div>
          <Button type="submit" size="lg" className="h-14 px-10 rounded-2xl w-full md:w-auto font-black shadow-lg shadow-primary-500/30 whitespace-nowrap">
            Générer le Scrutin
          </Button>
        </div>

      </form>
    </div>
  )
}

export default CreateElectionForm