import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  XMarkIcon, PlusIcon, ShieldCheckIcon, DocumentArrowUpIcon,
  LinkIcon, CheckCircleIcon, CameraIcon, UserCircleIcon,
} from '@heroicons/react/24/outline'
import Button from '../common/Button'
import Card from '../common/Card'
import { useElections } from '../../contexts/ElectionContext'
import { COUNTRIES } from '../../constants/countries'

// ─── factories ────────────────────────────────────────────────────────────────
const makeMember = () => ({ id: Date.now() + Math.random(), name: '', photoUrl: '' })
const makePart = () => ({ id: Date.now() + Math.random(), title: '', description: '', imageUrl: '', members: [] })
const makeSession = () => ({
  id: Date.now() + Math.random(),
  title: '',
  description: '',
  moderatorsText: '',
  voterCount: 0,
  votersText: '',
  parts: [makePart()],
})

// ─── helpers ──────────────────────────────────────────────────────────────────
const readPhoto = (file, cb) => {
  if (!file) return
  if (file.size > 2 * 1024 * 1024) { toast.error('Image trop volumineuse (> 2Mo)'); return }
  const r = new FileReader(); r.onloadend = () => cb(r.result); r.readAsDataURL(file)
}

const parseCSV = (text) => {
  return text.split(/[\n,;]/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.includes('@'))
}

// ─── VoteSessionForm ──────────────────────────────────────────────────────────
const VoteSessionForm = ({ session, sessionNumber, totalSessions, onChange, onRemove }) => {
  const set = (field, value) => onChange({ ...session, [field]: value })

  // parts
  const setPart = (pi, updated) => onChange({ ...session, parts: session.parts.map((p, i) => i === pi ? updated : p) })
  const addPart = () => onChange({ ...session, parts: [...session.parts, makePart()] })
  const rmPart = (pi) => { if (session.parts.length > 1) onChange({ ...session, parts: session.parts.filter((_, i) => i !== pi) }) }
  const setPartField = (pi, f, v) => setPart(pi, { ...session.parts[pi], [f]: v })
  const setPartPhoto = (pi, e) => readPhoto(e.target.files[0], v => setPartField(pi, 'imageUrl', v))

  // members
  const setMember = (pi, mi, f, v) => setPart(pi, { ...session.parts[pi], members: session.parts[pi].members.map((m, k) => k === mi ? { ...m, [f]: v } : m) })
  const addMember = (pi) => setPart(pi, { ...session.parts[pi], members: [...session.parts[pi].members, makeMember()] })
  const rmMember = (pi, mi) => setPart(pi, { ...session.parts[pi], members: session.parts[pi].members.filter((_, k) => k !== mi) })
  const setMemberPhoto = (pi, mi, e) => readPhoto(e.target.files[0], v => setMember(pi, mi, 'photoUrl', v))

  return (
    <div className="space-y-5">
      {/* session header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-2xl bg-primary-600 text-white text-sm font-black flex items-center justify-center shadow-md shadow-primary-200">
            {sessionNumber}
          </span>
          <div>
            <p className="text-lg font-black text-slate-900 tracking-tight leading-none">
              {session.title || `Session de vote ${sessionNumber}`}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Session indépendante</p>
          </div>
        </div>
        {totalSessions > 1 && (
          <button type="button" onClick={onRemove}
            className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 transition-all">
            <XMarkIcon className="w-4 h-4" /> Supprimer
          </button>
        )}
      </div>

      {/* A. Informations Essentielles */}
      <Card className="bg-white border-slate-100 shadow-sm p-6">
        <h3 className="text-xs font-black text-primary-600 uppercase tracking-[0.2em] mb-5">A. Informations Essentielles</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Titre du vote *</label>
            <input type="text" required value={session.title} onChange={e => set('title', e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium text-slate-900"
              placeholder="Ex: Élection du Président BDE" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Description (Optionnel)</label>
            <textarea rows="3" value={session.description} onChange={e => set('description', e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium text-slate-900"
              placeholder="Contexte et objectifs de ce vote..." />
          </div>
        </div>
      </Card>

      {/* B. Modérateurs */}
      <Card className="bg-white border-slate-100 shadow-sm p-6 border-l-4 border-l-secondary-500">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-xs font-black text-secondary-600 uppercase tracking-[0.2em] mb-1">B. Modérateurs (Validateurs)</h3>
            <p className="text-sm text-slate-500 font-medium">Consensus <span className="font-black text-secondary-600">100%</span> requis pour ouvrir ce vote.</p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Liste des modérateurs</label>
          <div className="h-16 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 hover:bg-secondary-50 transition-colors cursor-pointer group mb-3 relative overflow-hidden">
            <DocumentArrowUpIcon className="w-6 h-6 text-slate-400 group-hover:text-secondary-600 mb-1 transition-colors" />
            <span className="text-xs font-bold text-slate-500 group-hover:text-secondary-700">Importer CSV/TXT</span>
            <input type="file" accept=".csv,.txt" className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={e => {
                const file = e.target.files[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (re) => {
                    const emails = parseCSV(re.target.result)
                    const current = session.moderatorsText ? session.moderatorsText.split(/[\n,;]/).map(s => s.trim()).filter(Boolean) : []
                    const combined = [...new Set([...current, ...emails])]
                    set('moderatorsText', combined.join('\n'))
                    toast.success(`${emails.length} modérateurs importés`)
                  }
                  reader.readAsText(file)
                }
              }} />
          </div>
          <textarea rows="2" value={session.moderatorsText || ''} onChange={e => set('moderatorsText', e.target.value)}
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-secondary-500 font-medium text-sm text-slate-700 leading-relaxed"
            placeholder="mod1@epitech.eu&#10;mod2@epitech.eu" />
        </div>
      </Card>

      {/* C. Électeurs */}
      <Card className="bg-white border-slate-100 shadow-sm p-6">
        <h3 className="text-xs font-black text-primary-600 uppercase tracking-[0.2em] mb-5">C. Gestion des Électeurs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Taille du collège électoral</label>
            <input type="number" placeholder="0" min="0" value={session.voterCount} onChange={e => set('voterCount', e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-black text-2xl text-slate-900" />
            <p className="text-xs text-slate-400 font-medium mt-2">Pour calculer les taux de participation.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Liste des électeurs</label>
            <div className="h-16 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 hover:bg-primary-50 transition-colors cursor-pointer group mb-3 relative overflow-hidden">
              <DocumentArrowUpIcon className="w-6 h-6 text-slate-400 group-hover:text-primary-600 mb-1 transition-colors" />
              <span className="text-[10px] font-bold text-slate-500 group-hover:text-primary-600 transition-colors uppercase">CSV des votants</span>
              <input type="file" accept=".csv,.txt" className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={e => {
                  const file = e.target.files[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (re) => {
                      const emails = parseCSV(re.target.result)
                      const current = session.votersText.split(/[\n,;]/).map(s => s.trim()).filter(Boolean)
                      const combined = [...new Set([...current, ...emails])]
                      set('votersText', combined.join('\n'))
                      set('voterCount', combined.length)
                      toast.success(`${emails.length} électeurs importés`)
                    }
                    reader.readAsText(file)
                  }
                }} />
            </div>
            <textarea rows="2" value={session.votersText} onChange={e => set('votersText', e.target.value)}
              placeholder="Emails séparés par virgules ou retours à la ligne..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
      </Card>

      {/* D. Options / Listes Candidates */}
      <Card className="bg-white border-slate-100 shadow-sm p-6">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-xs font-black text-primary-600 uppercase tracking-[0.2em] mb-1">D. Options / Listes Candidates</h3>
            <p className="text-sm text-slate-500 font-medium">Les choix proposés aux électeurs pour ce vote.</p>
          </div>
          <Button type="button" onClick={addPart} size="sm" variant="outline" className="border-primary-200 text-primary-600 hover:bg-primary-50">
            <PlusIcon className="w-4 h-4 mr-2" /> Ajouter une option
          </Button>
        </div>

        <div className="space-y-5">
          {session.parts.map((part, pi) => (
            <div key={part.id} className="p-5 border border-slate-100 bg-slate-50/50 rounded-3xl relative">
              {session.parts.length > 1 && (
                <button type="button" onClick={() => rmPart(pi)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}

              {/* Part title + logo */}
              <div className="flex items-end gap-4 mb-4 pr-8">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Titre de l'option / Liste *</label>
                  <input type="text" required value={part.title} onChange={e => setPartField(pi, 'title', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: Liste Phénix" />
                </div>
                <div className="relative shrink-0">
                  <div className="h-14 w-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                    {part.imageUrl ? <img src={part.imageUrl} alt="Logo" className="h-full w-full object-cover" /> : <CameraIcon className="w-6 h-6 text-slate-300" />}
                  </div>
                  <label className="absolute -bottom-2 -right-2 h-6 w-6 bg-primary-600 rounded-lg flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-700 transition-colors">
                    <PlusIcon className="w-4 h-4 text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={e => setPartPhoto(pi, e)} />
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Description (Optionnel)</label>
                <textarea rows="2" value={part.description} onChange={e => setPartField(pi, 'description', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500"
                  placeholder="Programme, présentation de la liste..." />
              </div>

              {/* Membres */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Membres du parti (Optionnel)</label>
                  <button type="button" onClick={() => addMember(pi)}
                    className="flex items-center gap-1 text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase border border-primary-200 px-2.5 py-1 rounded-lg hover:bg-primary-50 transition-colors">
                    <PlusIcon className="w-3 h-3" /> Ajouter membre
                  </button>
                </div>
                {part.members.length === 0
                  ? <p className="text-xs text-slate-400 italic">Aucun membre ajouté.</p>
                  : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {part.members.map((member, mi) => (
                        <div key={member.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-3">
                          <div className="relative shrink-0">
                            <div className="h-10 w-10 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
                              {member.photoUrl ? <img src={member.photoUrl} alt={member.name} className="h-full w-full object-cover" /> : <UserCircleIcon className="w-7 h-7 text-slate-300" />}
                            </div>
                            <label className="absolute -bottom-1.5 -right-1.5 h-5 w-5 bg-primary-600 rounded-md flex items-center justify-center cursor-pointer shadow hover:bg-primary-700 transition-colors">
                              <CameraIcon className="w-3 h-3 text-white" />
                              <input type="file" className="hidden" accept="image/*" onChange={e => setMemberPhoto(pi, mi, e)} />
                            </label>
                          </div>
                          <input type="text" value={member.name} onChange={e => setMember(pi, mi, 'name', e.target.value)}
                            className="flex-1 text-sm font-medium bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400"
                            placeholder="Nom du membre..." />
                          <button type="button" onClick={() => rmMember(pi, mi)} className="shrink-0 text-slate-300 hover:text-red-400 transition-colors">
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── CreateElectionForm ───────────────────────────────────────────────────────
const CreateElectionForm = () => {
  const navigate = useNavigate()
  const { addElection } = useElections()
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')

  const [formData, setFormData] = useState({
    // ── General (shared)
    title: '',
    description: '',
    scope: 'international',
    country: '',
    timingMode: 'manual',
    startDate: '',
    endDate: '',
    // ── Per vote session
    voteSessions: [makeSession()],
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addVoteSession = () => setFormData(prev => ({ ...prev, voteSessions: [...prev.voteSessions, makeSession()] }))
  const removeVoteSession = (si) => {
    if (formData.voteSessions.length > 1)
      setFormData(prev => ({ ...prev, voteSessions: prev.voteSessions.filter((_, i) => i !== si) }))
  }
  const updateVoteSession = (si, updated) =>
    setFormData(prev => ({ ...prev, voteSessions: prev.voteSessions.map((s, i) => i === si ? updated : s) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Extract and deduplicate voters from all sessions
      const allVoters = new Set()
      formData.voteSessions.forEach(session => {
        const sessionVoters = session.votersText.split(/[\n,;]/).map(s => s.trim()).filter(Boolean)
        sessionVoters.forEach(v => allVoters.add(v))
      })
      const payload = {
        ...formData,
        voters: Array.from(allVoters),
        voteSessions: formData.voteSessions.map(session => ({
          ...session,
          moderators: session.moderatorsText ? session.moderatorsText.split(/[\n,;]/).map(e => e.trim()).filter(Boolean) : [],
          voters: session.votersText ? session.votersText.split(/[\n,;]/).map(e => e.trim()).filter(Boolean) : []
        }))
      }

      const result = await addElection(payload)
      if (result && result.address) {
        const voterLink = `${window.location.origin}/vote/${result.address}`
        setGeneratedLink(voterLink)
        setIsSubmitted(true)
        toast.success(`Scrutin créé ! Emails d'invitation envoyés aux modérateurs.`, {
          duration: 6000,
          icon: '📧'
        })
        toast.success('Redirection vers le détail...', { icon: '🚀' })
        // Optional: auto-redirect to admin detail after 3s
        setTimeout(() => {
          navigate(`/admin/elections/${result.address}`)
        }, 3000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ── success screen ────────────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <Card className="text-center p-12 bg-white shadow-2xl border-slate-100 rounded-[40px]">
          <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircleIcon className="w-12 h-12 text-primary-600" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">VoteChain : Scrutin Configuré</h2>
          <p className="text-slate-500 font-medium mb-10 max-w-xl mx-auto">
            Votre scrutin est maintenant prêt. Les modérateurs de chaque session ont été notifiés.
          </p>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 mb-10">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Lien d'accès (Votants)</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 w-full">
                <LinkIcon className="w-6 h-6 text-slate-400" />
                <input type="text" readOnly value={generatedLink} className="flex-1 bg-transparent border-none text-slate-600 font-medium focus:ring-0 text-sm" />
                <Button size="sm" variant="outline">Copier</Button>
              </div>
              <div className="w-32 h-32 bg-white border-4 border-slate-50 rounded-3xl p-2 shadow-xl">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generatedLink)}`} alt="QR Code" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
          <Button size="lg" onClick={() => navigate('/admin')} className="h-14 px-12 rounded-2xl">Retour au Dashboard</Button>
        </Card>
      </div>
    )
  }

  // ── main form ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center space-x-6 mb-10">
        <Link to="/admin" className="p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-colors shadow-sm">
          <XMarkIcon className="h-6 w-6 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Nouveau Scrutin</h1>
          <p className="text-slate-500 font-medium">Informations générales puis sessions de vote indépendantes.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* ════════════════════════════════════════════════
            PARTIE 1 — INFORMATIONS GÉNÉRALES
        ════════════════════════════════════════════════ */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 px-3 py-1.5 bg-slate-100 rounded-full">
              Partie 1 — Informations Générales
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="space-y-6">
            {/* 1. Informations du Scrutin */}
            <Card className="bg-white border-slate-100 shadow-sm p-8">
              <h2 className="text-xs font-black text-primary-600 uppercase tracking-[0.2em] mb-6">1. Informations du Scrutin</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Titre du scrutin *</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleChange}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium text-slate-900"
                    placeholder="Ex: Élections BDE 2024" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Description</label>
                  <textarea name="description" rows="3" value={formData.description} onChange={handleChange}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium text-slate-900"
                    placeholder="Contexte général du scrutin..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Portée / Scope</label>
                  <div className="flex gap-4">
                    {['national', 'international'].map(v => (
                      <label key={v} className={`flex-1 p-4 border rounded-2xl cursor-pointer transition-all ${formData.scope === v ? 'bg-primary-50 border-primary-500' : 'bg-slate-50 border-slate-200'}`}>
                        <input type="radio" name="scope" value={v} checked={formData.scope === v} onChange={handleChange} className="hidden" />
                        <span className={`font-bold ${formData.scope === v ? 'text-primary-700' : 'text-slate-600'}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {formData.scope === 'national' && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Pays concerné</label>
                    <select name="country" required value={formData.country} onChange={handleChange}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium text-slate-900 appearance-none">
                      <option value="">Sélectionnez un pays...</option>
                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </Card>

            {/* 2. Pilotage Temporel */}
            <Card className="bg-white border-slate-100 shadow-sm p-8">
              <h2 className="text-xs font-black text-primary-600 uppercase tracking-[0.2em] mb-6">2. Pilotage Temporel</h2>
              <div className="space-y-5">
                <div className="flex gap-4">
                  {[
                    { value: 'manual', label: 'Manuel', sub: 'Ouverture et fermeture par le panneau admin.' },
                    { value: 'scheduled', label: 'Programmé', sub: 'Dates définies à l\'avance.' },
                  ].map(({ value, label, sub }) => (
                    <label key={value} className={`flex-1 p-4 border rounded-2xl cursor-pointer transition-all ${formData.timingMode === value ? 'bg-primary-50 border-primary-500' : 'bg-slate-50 border-slate-200'}`}>
                      <input type="radio" name="timingMode" value={value} checked={formData.timingMode === value} onChange={handleChange} className="hidden" />
                      <span className={`font-bold block ${formData.timingMode === value ? 'text-primary-700' : 'text-slate-600'}`}>{label}</span>
                      <span className="text-xs text-slate-500 font-medium">{sub}</span>
                    </label>
                  ))}
                </div>
                {formData.timingMode === 'scheduled' && (
                  <div className="grid grid-cols-2 gap-4">
                    {[['startDate', 'Début'], ['endDate', 'Fin']].map(([name, label]) => (
                      <div key={name}>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">{label}</label>
                        <input type="datetime-local" name={name} value={formData[name]} onChange={handleChange}
                          className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            PARTIE 2 — SESSIONS DE VOTE
        ════════════════════════════════════════════════ */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 px-3 py-1.5 bg-slate-100 rounded-full">
              Partie 2 — Sessions de Vote
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <p className="text-sm text-slate-500 font-medium mb-6 text-center">
            Chaque session est un vote indépendant avec ses propres modérateurs, électeurs et candidats.
          </p>

          {/* Sessions */}
          <div className="space-y-2">
            {formData.voteSessions.map((session, si) => (
              <React.Fragment key={session.id}>
                {si > 0 && (
                  <div className="flex items-center gap-4 py-6">
                    <div className="flex-1 border-t-2 border-dashed border-slate-200" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session {si + 1}</span>
                    <div className="flex-1 border-t-2 border-dashed border-slate-200" />
                  </div>
                )}
                <VoteSessionForm
                  session={session}
                  sessionNumber={si + 1}
                  totalSessions={formData.voteSessions.length}
                  onChange={(updated) => updateVoteSession(si, updated)}
                  onRemove={() => removeVoteSession(si)}
                />
              </React.Fragment>
            ))}
          </div>

          {/* Add vote button */}
          <button type="button" onClick={addVoteSession}
            className="mt-8 w-full flex items-center justify-center gap-3 border-2 border-dashed border-primary-300 hover:border-primary-500 bg-primary-50/40 hover:bg-primary-50 text-primary-600 font-black text-sm uppercase tracking-widest py-5 rounded-3xl transition-all group">
            <span className="w-8 h-8 rounded-xl bg-primary-100 group-hover:bg-primary-200 flex items-center justify-center transition-colors">
              <PlusIcon className="w-5 h-5 text-primary-600" />
            </span>
            Ajouter un vote
          </button>
        </div>

        {/* Submit */}
        <div className="p-6 bg-slate-900 rounded-[32px] flex flex-col md:flex-row items-center gap-6 justify-between shadow-2xl">
          <div className="flex items-center gap-4">
            <ShieldCheckIcon className="w-12 h-12 text-primary-500 flex-shrink-0" />
            <div>
              <h4 className="text-white font-black text-lg tracking-tight">Hachage Blockchain</h4>
              <p className="text-slate-400 text-sm font-medium">Une fois soumis, les modérateurs de chaque session doivent approuver. Le contrat sera scellé.</p>
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