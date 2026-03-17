import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import {
    UserGroupIcon,
    ShieldCheckIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL

const VoterAdditionDecisionPage = () => {
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [loading, setLoading] = useState(true)
    const [request, setRequest] = useState(null)
    const [moderatorEmail, setModeratorEmail] = useState('')
    const [error, setError] = useState(null)

    const [decision, setDecision] = useState(null) // 'validate' | 'invalidate'
    const [reason, setReason] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone] = useState(null) // { status, message }

    useEffect(() => {
        if (!token) { setError('Lien invalide — token manquant.'); setLoading(false); return }
        fetch(`${API_BASE}/voter-addition-requests/${id}/review?token=${token}`)
            .then(r => r.json())
            .then(result => {
                if (result.success) {
                    setRequest(result.request)
                    setModeratorEmail(result.moderatorEmail)
                } else {
                    setError(result.error || 'Demande introuvable ou lien expiré.')
                }
            })
            .catch(() => setError('Erreur réseau. Veuillez réessayer.'))
            .finally(() => setLoading(false))
    }, [id, token])

    const handleSubmit = async () => {
        if (!decision) return
        if (decision === 'invalidate' && !reason.trim()) {
            toast.error('Veuillez fournir une raison pour invalider')
            return
        }
        setSubmitting(true)
        try {
            const res = await fetch(`${API_BASE}/voter-addition-requests/${id}/decide`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, decision, reason: reason.trim() }),
            })
            const result = await res.json()
            if (result.success) {
                setDone({
                    status: decision,
                    message: decision === 'validate'
                        ? result.status === 'approved'
                            ? 'Consensus atteint — les électeurs ont été ajoutés au scrutin.'
                            : 'Validation enregistrée. En attente des autres modérateurs.'
                        : 'Invalidation enregistrée. L\'administrateur a été notifié.',
                })
            } else {
                toast.error(result.error || 'Erreur lors de la soumission')
            }
        } catch {
            toast.error('Erreur réseau')
        } finally {
            setSubmitting(false)
        }
    }

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="h-10 w-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
        </div>
    )

    // ── Error ────────────────────────────────────────────────────────────────
    if (error) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <XCircleIcon className="w-8 h-8 text-rose-500" />
                </div>
                <h1 className="text-xl font-black text-slate-900 mb-3">Lien invalide</h1>
                <p className="text-sm text-slate-500 font-medium">{error}</p>
            </div>
        </div>
    )

    // ── Already decided ──────────────────────────────────────────────────────
    if (request?.status !== 'pending' && !done) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md w-full text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${request.status === 'approved' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    {request.status === 'approved'
                        ? <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
                        : <XCircleIcon className="w-8 h-8 text-rose-500" />}
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${request.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                    {request.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                </span>
                <h1 className="text-xl font-black text-slate-900 mt-4 mb-2">Cette demande est clôturée</h1>
                <p className="text-sm text-slate-500 font-medium">La décision finale a déjà été enregistrée pour cette demande.</p>
            </div>
        </div>
    )

    // ── Done ─────────────────────────────────────────────────────────────────
    if (done) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md w-full text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${done.status === 'validate' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    {done.status === 'validate'
                        ? <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
                        : <XCircleIcon className="w-8 h-8 text-rose-500" />}
                </div>
                <h1 className="text-xl font-black text-slate-900 mb-3">Décision enregistrée</h1>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{done.message}</p>
                <p className="text-xs text-slate-400 mt-6">Vous pouvez fermer cette fenêtre.</p>
            </div>
        </div>
    )

    // ── Main form ────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-lg mx-auto space-y-6">

                {/* Header */}
                <div className="text-center">
                    <span className="inline-block bg-slate-900 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl mb-4">EpiVote</span>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Demande d'ajout d'électeurs</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Vous êtes invité à valider ou invalider cet ajout</p>
                </div>

                {/* Request details */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-7 space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0">
                            <ShieldCheckIcon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{request.scrutinTitle}</p>
                            <p className="text-base font-black text-slate-900">{request.sessionTitle}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Électeurs à ajouter</p>
                            <p className="text-2xl font-black text-slate-900">{request.emails.length}</p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Validations reçues</p>
                            <p className="text-2xl font-black text-slate-900">{request.validateCount} <span className="text-slate-400 text-base font-bold">/ {request.moderatorCount}</span></p>
                        </div>
                    </div>

                    {/* Email list */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <UserGroupIcon className="w-4 h-4 text-slate-400" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Liste des emails</p>
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                            {request.emails.map((email, i) => (
                                <div key={i} className="text-xs font-mono text-slate-600 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
                                    {email}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                        <p className="text-[10px] text-slate-400 font-medium">
                            Modérateur connecté : <span className="font-black text-slate-600">{moderatorEmail}</span>
                        </p>
                    </div>
                </div>

                {/* Decision buttons */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-7 space-y-4">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Votre décision</p>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => { setDecision('validate'); setReason('') }}
                            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${decision === 'validate' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50/50'}`}
                        >
                            <CheckCircleIcon className={`w-8 h-8 ${decision === 'validate' ? 'text-emerald-600' : 'text-slate-300'}`} />
                            <span className={`text-xs font-black uppercase tracking-widest ${decision === 'validate' ? 'text-emerald-700' : 'text-slate-400'}`}>Valider</span>
                        </button>
                        <button
                            onClick={() => setDecision('invalidate')}
                            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${decision === 'invalidate' ? 'border-rose-500 bg-rose-50' : 'border-slate-100 bg-slate-50 hover:border-rose-200 hover:bg-rose-50/50'}`}
                        >
                            <XCircleIcon className={`w-8 h-8 ${decision === 'invalidate' ? 'text-rose-600' : 'text-slate-300'}`} />
                            <span className={`text-xs font-black uppercase tracking-widest ${decision === 'invalidate' ? 'text-rose-700' : 'text-slate-400'}`}>Invalider</span>
                        </button>
                    </div>

                    {decision === 'invalidate' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Raison de l'invalidation *</label>
                            <textarea
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="Expliquez pourquoi vous invalidez cet ajout…"
                                rows={3}
                                className="w-full text-sm border border-slate-200 rounded-2xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                            />
                        </div>
                    )}

                    {decision && (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || (decision === 'invalidate' && !reason.trim())}
                            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all disabled:opacity-50 ${decision === 'validate' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                        >
                            {submitting ? 'Envoi en cours…' : decision === 'validate' ? 'Confirmer la validation' : 'Confirmer l\'invalidation'}
                        </button>
                    )}
                </div>

                <p className="text-center text-[10px] text-slate-400 font-medium">
                    Le consensus de 100% des modérateurs est requis pour que l'ajout soit effectif.
                </p>
            </div>
        </div>
    )
}

export default VoterAdditionDecisionPage
