import React, { useState, useEffect, useRef } from 'react'
import { useConfetti } from '../../hooks/useConfetti'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon, PlusIcon, ShieldCheckIcon, DocumentArrowUpIcon,
  LinkIcon, CheckCircleIcon, CameraIcon, UserCircleIcon,
  ArrowRightIcon, ArrowLeftIcon, InformationCircleIcon,
  CalendarIcon, UsersIcon, CubeTransparentIcon, ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline'
import Button from '../common/Button'
import Card from '../common/Card'
import { useElections } from '../../contexts/ElectionContext'
import { COUNTRIES } from '../../constants/countries'
import { QRCodeCanvas } from 'qrcode.react'

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

// ─── helpers ─────────────────────────────────────────────────────────────────
const readPhoto = (file, cb) => {
  if (!file) return
  if (file.size > 2 * 1024 * 1024) { toast.error('Image trop volumineuse (max 2 Mo)'); return }
  const r = new FileReader(); r.onloadend = () => cb(r.result); r.readAsDataURL(file)
}
const parseCSV = (text) => text.split(/[\n,;]/).map(s => s.trim()).filter(s => s.length > 0 && s.includes('@'))

// ─── Wizard Stepper ───────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Informations', icon: InformationCircleIcon, sublabel: 'Scrutin & Portée' },
  { label: 'Calendrier', icon: CalendarIcon, sublabel: 'Dates & Mode' },
  { label: 'Sessions', icon: UsersIcon, sublabel: 'Votes & Candidats' },
  { label: 'Récapitulatif', icon: ClipboardDocumentCheckIcon, sublabel: 'Réviser & Déployer' },
]

const WizardStepper = ({ currentStep }) => (
  <div className="flex items-center w-full mb-10">
    {STEPS.map((step, idx) => {
      const Icon = step.icon
      const isActive = idx === currentStep
      const isDone = idx < currentStep
      return (
        <React.Fragment key={idx}>
          <div className="flex flex-col items-center gap-1.5 relative flex-shrink-0">
            <motion.div
              animate={{ scale: isActive ? 1.08 : 1 }}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm
                ${isDone ? 'bg-emerald-500 shadow-emerald-200' : isActive ? 'bg-primary-600 shadow-primary-200 shadow-lg' : 'bg-slate-100'}`}
            >
              {isDone
                ? <CheckCircleIcon className="w-5 h-5 text-white" />
                : <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              }
            </motion.div>
            <div className="text-center leading-tight hidden sm:block">
              <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-primary-600' : isDone ? 'text-emerald-600' : 'text-slate-400'}`}>{step.label}</p>
              <p className="text-[9px] text-slate-400 font-medium">{step.sublabel}</p>
            </div>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${idx < currentStep ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      )
    })}
  </div>
)

// ─── Blockchain Loading Modal ──────────────────────────────────────────────────
const DEPLOY_MESSAGES = [
  'Préparation du contrat intelligent...',
  'Signature et envoi de la transaction...',
  'Attente de la confirmation réseau...',
  'Enregistrement des sessions de vote...',
  'Envoi des invitations aux modérateurs...',
  'Finalisation et indexation...',
]

const BlockchainLoadingModal = ({ isOpen }) => {
  const [msgIdx, setMsgIdx] = useState(0)
  useEffect(() => {
    if (!isOpen) return
    setMsgIdx(0)
    const iv = setInterval(() => setMsgIdx(p => (p + 1) % DEPLOY_MESSAGES.length), 2000)
    return () => clearInterval(iv)
  }, [isOpen])

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[32px] p-10 max-w-sm w-full text-center shadow-2xl"
      >
        <div className="relative w-20 h-20 mx-auto mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-4 border-primary-200 border-t-primary-600"
          />
          <div className="absolute inset-2 bg-primary-50 rounded-full flex items-center justify-center">
            <CubeTransparentIcon className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">Déploiement en cours</h3>
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-sm text-slate-500 font-medium h-10 flex items-center justify-center"
          >
            {DEPLOY_MESSAGES[msgIdx]}
          </motion.p>
        </AnimatePresence>
        <div className="mt-4 flex gap-1 justify-center">
          {DEPLOY_MESSAGES.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === msgIdx ? 'w-6 bg-primary-600' : 'w-1.5 bg-slate-200'}`} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// ─── VoteSessionForm ──────────────────────────────────────────────────────────
const VoteSessionForm = ({ session, sessionNumber, totalSessions, onChange, onRemove }) => {
  const set = (field, value) => onChange({ ...session, [field]: value })
  const setPart = (pi, updated) => onChange({ ...session, parts: session.parts.map((p, i) => i === pi ? updated : p) })
  const addPart = () => onChange({ ...session, parts: [...session.parts, makePart()] })
  const rmPart = (pi) => { if (session.parts.length > 1) onChange({ ...session, parts: session.parts.filter((_, i) => i !== pi) }) }
  const setPartField = (pi, f, v) => setPart(pi, { ...session.parts[pi], [f]: v })
  const setPartPhoto = (pi, e) => readPhoto(e.target.files[0], v => setPartField(pi, 'imageUrl', v))
  const setMember = (pi, mi, f, v) => setPart(pi, { ...session.parts[pi], members: session.parts[pi].members.map((m, k) => k === mi ? { ...m, [f]: v } : m) })
  const addMember = (pi) => setPart(pi, { ...session.parts[pi], members: [...session.parts[pi].members, makeMember()] })
  const rmMember = (pi, mi) => setPart(pi, { ...session.parts[pi], members: session.parts[pi].members.filter((_, k) => k !== mi) })
  const setMemberPhoto = (pi, mi, e) => readPhoto(e.target.files[0], v => setMember(pi, mi, 'photoUrl', v))

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-slate-200 rounded-3xl p-6 space-y-5 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-primary-600 text-white text-sm font-black flex items-center justify-center shadow-md shadow-primary-200">{sessionNumber}</span>
          <div>
            <p className="text-base font-black text-slate-900 leading-none">{session.title || `Session ${sessionNumber}`}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Vote indépendant</p>
          </div>
        </div>
        {totalSessions > 1 && (
          <button type="button" onClick={onRemove} className="flex items-center gap-1.5 text-xs font-bold text-red-500 border border-red-100 hover:border-red-300 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 transition-all">
            <XMarkIcon className="w-4 h-4" /> Supprimer
          </button>
        )}
      </div>

      {/* A. Informations */}
      <div className="space-y-4 p-5 bg-slate-50 rounded-2xl">
        <h3 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">A. Informations</h3>
        <input type="text" required value={session.title} onChange={e => set('title', e.target.value)}
          className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium text-slate-900"
          placeholder="Titre du vote *" />
        <textarea rows="2" value={session.description} onChange={e => set('description', e.target.value)}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium text-slate-900 text-sm"
          placeholder="Description (Optionnel)" />
      </div>

      {/* B. Modérateurs */}
      <div className="space-y-3 p-5 bg-orange-50/60 border border-orange-100 rounded-2xl">
        <div>
          <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em]">B. Modérateurs (100% consensus requis)</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Ces personnes valideront ou invalideront le vote.</p>
        </div>
        <label className="h-14 border-2 border-dashed border-orange-200 rounded-2xl flex items-center justify-center gap-2 bg-white hover:bg-orange-50 cursor-pointer relative overflow-hidden transition-colors w-full">
          <DocumentArrowUpIcon className="w-5 h-5 text-orange-400 pointer-events-none" />
          <span className="text-xs font-bold text-orange-600 pointer-events-none">Importer CSV/TXT</span>
          <input type="file" accept=".csv,.txt" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            onChange={e => {
              const file = e.target.files[0]; if (!file) return
              const reader = new FileReader()
              reader.onload = (re) => {
                const emails = parseCSV(re.target.result)
                const current = session.moderatorsText ? session.moderatorsText.split(/[\n,;]/).map(s => s.trim()).filter(Boolean) : []
                set('moderatorsText', [...new Set([...current, ...emails])].join('\n'))
                toast.success(`${emails.length} modérateurs importés`)
              }
              reader.readAsText(file)
            }} />
        </label>
        <textarea rows="2" value={session.moderatorsText || ''} onChange={e => set('moderatorsText', e.target.value)}
          className="w-full px-4 py-3 bg-white border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 font-medium text-sm text-slate-700"
          placeholder="mod1@epitech.eu&#10;mod2@epitech.eu" />
      </div>

      {/* C. Électeurs */}
      <div className="space-y-3 p-5 bg-slate-50 rounded-2xl">
        <h3 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">C. Électeurs</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Taille du collège</label>
            <input type="number" min="0" value={session.voterCount} onChange={e => set('voterCount', e.target.value)}
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-black text-xl text-slate-900" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Liste des électeurs</label>
            <label className="h-12 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 bg-white hover:bg-primary-50 cursor-pointer relative overflow-hidden transition-colors mb-2 w-full">
              <DocumentArrowUpIcon className="w-4 h-4 text-slate-400 pointer-events-none" />
              <span className="text-xs font-bold text-slate-500 pointer-events-none">Importer CSV</span>
              <input type="file" accept=".csv,.txt" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={e => {
                  const file = e.target.files[0]; if (!file) return
                  const reader = new FileReader()
                  reader.onload = (re) => {
                    const emails = parseCSV(re.target.result)
                    const current = session.votersText.split(/[\n,;]/).map(s => s.trim()).filter(Boolean)
                    const combined = [...new Set([...current, ...emails])]
                    onChange({ ...session, votersText: combined.join('\n'), voterCount: combined.length })
                    toast.success(`${emails.length} électeurs importés`)
                  }
                  reader.readAsText(file)
                }} />
            </label>
          </div>
        </div>
        <textarea rows="2" value={session.votersText}
          onChange={e => {
            const val = e.target.value
            const count = val.split(/[\n,;]/).map(s => s.trim()).filter(Boolean).length
            onChange({ ...session, votersText: val, voterCount: count })
          }}
          placeholder="voter1@ecole.eu, voter2@ecole.eu..."
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-primary-500 text-slate-700" />
      </div>

      {/* D. Options / Listes Candidates */}
      <div className="space-y-4 p-5 bg-slate-50 rounded-2xl">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">D. Options / Listes Candidates</h3>
          <button type="button" onClick={addPart} className="flex items-center gap-1 text-[10px] font-black text-primary-600 border border-primary-200 px-2.5 py-1 rounded-lg hover:bg-primary-50 transition-colors">
            <PlusIcon className="w-3 h-3" /> Ajouter
          </button>
        </div>
        <div className="space-y-4">
          {session.parts.map((part, pi) => (
            <div key={part.id} className="p-4 border border-slate-200 bg-white rounded-2xl relative">
              {session.parts.length > 1 && (
                <button type="button" onClick={() => rmPart(pi)} className="absolute top-3 right-3 text-slate-300 hover:text-red-400 transition-colors">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-end gap-3 mb-3 pr-6">
                <div className="flex-1">
                  <input type="text" required value={part.title} onChange={e => setPartField(pi, 'title', e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder={`Option ${pi + 1} / Nom de la liste *`} />
                </div>
                <div className="relative shrink-0">
                  <div className="h-12 w-12 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                    {part.imageUrl ? <img src={part.imageUrl} alt="Logo" className="h-full w-full object-cover" /> : <CameraIcon className="w-5 h-5 text-slate-300" />}
                  </div>
                  <label className="absolute -bottom-1.5 -right-1.5 h-5 w-5 bg-primary-600 rounded-lg flex items-center justify-center cursor-pointer shadow hover:bg-primary-700">
                    <PlusIcon className="w-3 h-3 text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={e => setPartPhoto(pi, e)} />
                  </label>
                </div>
              </div>
              <textarea rows="2" value={part.description} onChange={e => setPartField(pi, 'description', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary-500 mb-3"
                placeholder="Description de la liste (optionnel)" />
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Membres</label>
                  <button type="button" onClick={() => addMember(pi)} className="flex items-center gap-1 text-[10px] font-black text-primary-600 border border-primary-200 px-2 py-0.5 rounded-lg hover:bg-primary-50">
                    <PlusIcon className="w-3 h-3" /> + membre
                  </button>
                </div>
                {part.members.length === 0
                  ? <p className="text-xs text-slate-400 italic">Aucun membre. (Optionnel)</p>
                  : <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {part.members.map((member, mi) => (
                      <div key={member.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                        <div className="relative shrink-0">
                          <div className="h-8 w-8 bg-white rounded-lg overflow-hidden flex items-center justify-center">
                            {member.photoUrl ? <img src={member.photoUrl} className="h-full w-full object-cover" alt="" /> : <UserCircleIcon className="w-6 h-6 text-slate-300" />}
                          </div>
                          <label className="absolute -bottom-1 -right-1 h-4 w-4 bg-primary-600 rounded flex items-center justify-center cursor-pointer">
                            <CameraIcon className="w-2.5 h-2.5 text-white" />
                            <input type="file" className="hidden" accept="image/*" onChange={e => setMemberPhoto(pi, mi, e)} />
                          </label>
                        </div>
                        <input type="text" value={member.name} onChange={e => setMember(pi, mi, 'name', e.target.value)}
                          className="flex-1 text-xs font-medium bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400"
                          placeholder="Nom du membre..." />
                        <button type="button" onClick={() => rmMember(pi, mi)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0">
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── CreateElectionForm ────────────────────────────────────────────────────────
const CreateElectionForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { elections, addElection } = useElections()
  const [step, setStep] = useState(0)
  const { celebrate } = useConfetti()
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')
  const qrRef = useRef(null)

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.download = 'epivote-qrcode.png'
    a.href = url
    a.click()
  }

  const [formData, setFormData] = useState({
    title: '', description: '', scope: 'international', country: '',
    timingMode: 'manual', startDate: '', endDate: '', logoUrl: '',
    voteSessions: [makeSession()],
  })

  useEffect(() => {
    if (id && elections.length > 0) {
      const el = elections.find(e => e.id === id)
      if (el) {
        setFormData({
          title: el.title || '', description: el.description || '',
          scope: el.type || 'international', country: el.country || '',
          timingMode: el.timingMode || 'manual',
          startDate: el.startDate ? new Date(el.startDate).toISOString().split('T')[0] : '',
          endDate: el.endDate ? new Date(el.endDate).toISOString().split('T')[0] : '',
          logoUrl: el.logoUrl || '',
          voteSessions: el.sessions?.map(s => ({
            id: s.address || Math.random(),
            title: s.title || '', description: s.description || '',
            moderatorsText: (s.moderators || []).map(m => typeof m === 'string' ? m : m.email).join('\n'),
            voterCount: s.voters?.length || s.voterCount || 0,
            votersText: (s.voters || []).join('\n'),
            parts: (s.options || []).map(o => ({ id: o.id || Math.random(), title: o.title || '', description: o.description || '', imageUrl: o.imageUrl || '', members: o.members || [] }))
          })) || [makeSession()]
        })
      }
    }
  }, [id, elections])

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

  const validateStep = () => {
    if (step === 0) {
      if (!formData.title.trim()) { toast.error('Le titre du scrutin est requis.'); return false }
      if (formData.scope === 'national' && !formData.country) { toast.error('Veuillez sélectionner un pays.'); return false }
    }
    if (step === 2) {
      for (const s of formData.voteSessions) {
        if (!s.title.trim()) { toast.error('Chaque session doit avoir un titre.'); return false }
        if (s.parts.some(p => !p.title.trim())) { toast.error('Chaque option doit avoir un titre.'); return false }
      }
    }
    return true
  }

  const handleNext = () => { if (validateStep()) setStep(s => Math.min(s + 1, 3)) }
  const handleBack = () => setStep(s => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const allVoters = new Set()
      formData.voteSessions.forEach(session => {
        session.votersText.split(/[\n,;]/).map(s => s.trim().toLowerCase()).filter(Boolean).forEach(v => allVoters.add(v))
      })
      const payload = {
        ...formData,
        voters: Array.from(allVoters),
        voteSessions: formData.voteSessions.map(session => ({
          ...session,
          moderators: [...new Set((session.moderatorsText || '').split(/[\n,;]/).map(e => e.trim().toLowerCase()).filter(Boolean))],
          voters:    [...new Set((session.votersText    || '').split(/[\n,;]/).map(e => e.trim().toLowerCase()).filter(Boolean))]
        }))
      }
      const result = await addElection(payload)
      if (result && result.address) {
        setGeneratedLink(`${import.meta.env.VITE_FRONTEND_URL || window.location.origin}/vote/${result.address}`)
        setIsSubmitted(true)
        celebrate()
        toast.success('Scrutin déployé ! Invitations envoyées aux modérateurs.', { duration: 6000, icon: '📧' })
        setTimeout(() => navigate(`/election/${result.address}`), 4000)
      }
    } catch (err) {
      console.error(err)
      toast.error("Erreur lors du déploiement. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  // ── Success Screen ────────────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <Card className="text-center p-12 bg-white shadow-2xl border-slate-100 rounded-[40px]">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-emerald-100">
            <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">Scrutin Déployé !</h2>
          <p className="text-slate-500 font-medium mb-10 max-w-xl mx-auto">
            Votre scrutin est scellé sur la blockchain. Les modérateurs ont été notifiés par email.
          </p>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 mb-10 text-left">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Lien d'accès (Votants)</h3>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 w-full overflow-hidden">
                <LinkIcon className="w-5 h-5 text-slate-400 shrink-0" />
                <p className="text-sm font-mono text-slate-600 truncate">{generatedLink}</p>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(generatedLink); toast.success('Lien copié !') }}
                className="px-4 py-2 bg-primary-600 text-white text-sm font-black rounded-xl hover:bg-primary-700 transition-colors whitespace-nowrap">
                Copier
              </button>
            </div>
            <div className="mt-4 flex flex-col items-center gap-3">
              <div ref={qrRef} className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <QRCodeCanvas value={generatedLink} size={140} level="H" includeMargin={false} />
              </div>
              <button
                onClick={downloadQR}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-black transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Télécharger le QR Code
              </button>
            </div>
          </div>
          <Button size="lg" onClick={() => navigate('/admin')} className="h-14 px-12 rounded-2xl">Retour au Dashboard</Button>
        </Card>
      </div>
    )
  }

  // ── Step Content Renderer ─────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 0: // Informations Générales
        return (
          <motion.div key="step0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-6">
            <Card className="bg-white border-slate-100 shadow-sm p-7">
              <h2 className="text-xs font-black text-primary-600 uppercase tracking-[0.2em] mb-6">Informations du Scrutin</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Titre du scrutin *</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleChange}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium text-slate-900 text-lg"
                    placeholder="Ex: Élections BDE 2025" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Description</label>
                  <textarea name="description" rows="3" value={formData.description} onChange={handleChange}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium text-slate-900"
                    placeholder="Contexte général du scrutin..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Logo du Scrutin (Optionnel)</label>
                  <div className="relative group h-24 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-100 transition-all">
                    {formData.logoUrl
                      ? <img src={formData.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                      : <div className="flex flex-col items-center gap-1">
                        <CameraIcon className="w-6 h-6 text-slate-300" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Choisir une image</span>
                      </div>
                    }
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*"
                      onChange={e => readPhoto(e.target.files[0], v => setFormData(p => ({ ...p, logoUrl: v })))} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Portée</label>
                  <div className="flex gap-3">
                    {['national', 'international'].map(v => (
                      <label key={v} className={`flex-1 p-4 border rounded-2xl cursor-pointer transition-all ${formData.scope === v ? 'bg-primary-50 border-primary-400' : 'bg-slate-50 border-slate-200'}`}>
                        <input type="radio" name="scope" value={v} checked={formData.scope === v} onChange={handleChange} className="hidden" />
                        <span className={`font-bold text-sm ${formData.scope === v ? 'text-primary-700' : 'text-slate-600'}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {formData.scope === 'national' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Pays</label>
                    <select name="country" required value={formData.country} onChange={handleChange}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium text-slate-900 appearance-none">
                      <option value="">Sélectionnez un pays...</option>
                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )

      case 1: // Calendrier
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-6">
            <Card className="bg-white border-slate-100 shadow-sm p-7">
              <h2 className="text-xs font-black text-primary-600 uppercase tracking-[0.2em] mb-6">Pilotage Temporel</h2>
              <div className="space-y-5">
                <div className="flex gap-3">
                  {[{ value: 'manual', label: 'Manuel', sub: 'Ouverture par le panneau admin.' }, { value: 'scheduled', label: 'Programmé', sub: 'Dates définies à l\'avance.' }].map(({ value, label, sub }) => (
                    <label key={value} className={`flex-1 p-5 border rounded-2xl cursor-pointer transition-all ${formData.timingMode === value ? 'bg-primary-50 border-primary-400' : 'bg-slate-50 border-slate-200'}`}>
                      <input type="radio" name="timingMode" value={value} checked={formData.timingMode === value} onChange={handleChange} className="hidden" />
                      <span className={`font-black block text-sm ${formData.timingMode === value ? 'text-primary-700' : 'text-slate-700'}`}>{label}</span>
                      <span className="text-xs text-slate-500 font-medium">{sub}</span>
                    </label>
                  ))}
                </div>
                {formData.timingMode === 'scheduled' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[['startDate', 'Date de début'], ['endDate', 'Date de fin']].map(([name, label]) => (
                      <div key={name}>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">{label}</label>
                        <input type="datetime-local" name={name} value={formData[name]} onChange={handleChange}
                          className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium" />
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </Card>
            <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
              <InformationCircleIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-600 font-medium leading-relaxed">
                En mode <strong>Manuel</strong>, le scrutin n'est accèssible aux votants que lorsque toutes leurs sessions sont validées par les modérateurs. En mode <strong>Programmé</strong>, une date supplémentaire est utilisée pour afficher le statut.
              </p>
            </div>
          </motion.div>
        )

      case 2: // Sessions de Vote
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">Sessions de Vote</h2>
                <p className="text-sm text-slate-500 font-medium">Chaque session est un vote indépendant.</p>
              </div>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-black rounded-full">{formData.voteSessions.length} session(s)</span>
            </div>
            <div className="space-y-4">
              {formData.voteSessions.map((session, si) => (
                <VoteSessionForm key={session.id} session={session} sessionNumber={si + 1}
                  totalSessions={formData.voteSessions.length}
                  onChange={(updated) => updateVoteSession(si, updated)}
                  onRemove={() => removeVoteSession(si)} />
              ))}
            </div>
            <button type="button" onClick={addVoteSession}
              className="w-full flex items-center justify-center gap-3 border-2 border-dashed border-primary-300 hover:border-primary-500 bg-primary-50/40 hover:bg-primary-50 text-primary-600 font-black text-sm uppercase tracking-widest py-5 rounded-3xl transition-all group">
              <span className="w-8 h-8 rounded-xl bg-primary-100 group-hover:bg-primary-200 flex items-center justify-center">
                <PlusIcon className="w-5 h-5" />
              </span>
              Ajouter un vote
            </button>
          </motion.div>
        )

      case 3: // Récapitulatif
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-6">
            <h2 className="text-xl font-black text-slate-900">Récapitulatif final</h2>
            <Card className="p-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Scrutin</h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-sm text-slate-500 font-medium">Titre</span><span className="text-sm font-black text-slate-900">{formData.title || '—'}</span></div>
                <div className="flex justify-between"><span className="text-sm text-slate-500 font-medium">Portée</span><span className="text-sm font-black text-slate-900">{formData.scope}</span></div>
                <div className="flex justify-between"><span className="text-sm text-slate-500 font-medium">Mode</span><span className="text-sm font-black text-slate-900">{formData.timingMode}</span></div>
                <div className="flex justify-between"><span className="text-sm text-slate-500 font-medium">Sessions</span><span className="text-sm font-black text-slate-900">{formData.voteSessions.length}</span></div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 font-medium">Électeurs totaux</span>
                  <span className="text-sm font-black text-slate-900">
                    {new Set(formData.voteSessions.flatMap(s => s.votersText.split(/[\n,;]/).map(v => v.trim().toLowerCase()).filter(Boolean))).size}
                  </span>
                </div>
              </div>
            </Card>
            <Card className="p-8 bg-white border-slate-100 shadow-sm rounded-[32px] mb-8">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Résumé des Sessions</h3>
              <div className="space-y-4">
                {formData.voteSessions.map((s, i) => {
                  const voters = [...new Set((s.votersText || '').split(/[\n,;]/).map(v => v.trim().toLowerCase()).filter(Boolean))];
                  const mods = [...new Set((s.moderatorsText || '').split(/[\n,;]/).map(e => e.trim().toLowerCase()).filter(Boolean))];
                  return (
                    <div key={s.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-primary-600 text-white text-xs font-black rounded-lg flex items-center justify-center shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate">{s.title || `Session ${i + 1}`}</p>
                          <p className="text-xs text-slate-500 font-medium">{s.parts.length} option(s) · {voters.length} électeur(s) · {mods.length} modérateur(s)</p>
                        </div>
                      </div>
                      {mods.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Modérateurs</p>
                          <div className="flex flex-wrap gap-1.5">
                            {mods.map((m, mi) => (
                              <span key={mi} className="px-2 py-0.5 bg-secondary-50 border border-secondary-100 text-secondary-700 text-[11px] font-bold rounded-lg">{m}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {voters.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Électeurs ({voters.length})</p>
                          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                            {voters.map((v, vi) => (
                              <span key={vi} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-lg">{v}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )
      default: return null
    }
  }

  // ── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-24 px-4 sm:px-0">
      <BlockchainLoadingModal isOpen={loading} />

      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <Link to="/admin" className="p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-colors shadow-sm shrink-0">
          <XMarkIcon className="h-5 w-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nouveau Scrutin</h1>
          <p className="text-slate-500 font-medium text-sm">Configurez votre scrutin étape par étape.</p>
        </div>
      </div>

      {/* Stepper */}
      <WizardStepper currentStep={step} />

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>

      {/* Navigation Buttons — visible on ALL steps including recap */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={handleBack} disabled={step === 0}
          className={`h-12 px-6 rounded-2xl flex items-center gap-2 ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}>
          <ArrowLeftIcon className="w-4 h-4" /> Précédent
        </Button>
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-primary-600' : i < step ? 'w-3 bg-emerald-400' : 'w-3 bg-slate-200'}`} />
          ))}
        </div>
        {step < 3 ? (
          <Button type="button" onClick={handleNext} className="h-12 px-6 rounded-2xl flex items-center gap-2">
            {step === 2 ? 'Récapitulatif' : 'Suivant'} <ArrowRightIcon className="w-4 h-4" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} size="lg" disabled={loading}
            className="h-12 px-8 rounded-2xl font-black shadow-lg shadow-primary-500/30 flex items-center gap-2">
            {loading ? 'Déploiement...' : 'Générer le Scrutin'}
          </Button>
        )}
      </div>
    </div>
  )
}

export default CreateElectionForm