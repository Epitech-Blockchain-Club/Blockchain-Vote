import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { ShieldCheckIcon as ShieldSolid } from '@heroicons/react/24/solid'
import {
    ArrowPathIcon,
    LockClosedIcon,
    ChartBarIcon,
    DocumentArrowDownIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline'

const API_BASE = import.meta.env.VITE_API_URL

// ─── Participation Gauge (semi-arc) ──────────────────────────────────────────
const ParticipationGauge = ({ value, max = 100, label, color = '#3b82f6' }) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100))
    const radius = 50
    const circ = Math.PI * radius
    const dashOffset = circ - (pct / 100) * circ

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-36 h-20 overflow-hidden">
                <svg viewBox="0 0 120 65" className="w-full h-full">
                    <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
                    <motion.path
                        d="M10,60 A50,50 0 0,1 110,60"
                        fill="none"
                        stroke={color}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: dashOffset }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                    <span className="text-2xl font-black text-slate-900 leading-none">{Math.round(pct)}%</span>
                </div>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 text-center">{label}</p>
        </div>
    )
}

const ModeratorReportPage = () => {
    const { id } = useParams()
    const { user, loginWithGoogle, loginWithOffice365 } = useAuth()

    const [access, setAccess] = useState(null)      // null | 'checking' | 'granted' | 'denied'
    const [scrutinTitle, setScrutinTitle] = useState('')
    const [voterCount, setVoterCount] = useState(0)
    const [votedCount, setVotedCount] = useState(0)
    const [results, setResults] = useState(null)
    const [loadingResults, setLoadingResults] = useState(false)
    const [lastRefresh, setLastRefresh] = useState(null)

    // Verify moderator access once authenticated
    useEffect(() => {
        if (!user) { setAccess(null); return }
        setAccess('checking')
        fetch(`${API_BASE}/scrutins/${id}/monitor-access?email=${encodeURIComponent(user.email)}`)
            .then(r => r.json())
            .then(result => {
                if (result.success) {
                    setAccess('granted')
                    setScrutinTitle(result.scrutin?.title || '')
                    setVoterCount(result.scrutin?.voterCount || 0)
                    setVotedCount(result.scrutin?.votedCount || 0)
                } else {
                    setAccess('denied')
                }
            })
            .catch(() => setAccess('denied'))
    }, [user, id])

    // Fetch live results
    const fetchResults = useCallback(async () => {
        if (access !== 'granted') return
        setLoadingResults(true)
        try {
            const res = await fetch(`${API_BASE}/scrutins/${id}/results`)
            const data = await res.json()
            if (data.success) {
                setResults(data.sessions || data.data || [])
                if (data.votedCount !== undefined) setVotedCount(data.votedCount)
                if (data.voterCount !== undefined) setVoterCount(data.voterCount)
                setLastRefresh(new Date())
            }
        } catch (e) {
            console.error('Failed to fetch results', e)
        } finally {
            setLoadingResults(false)
        }
    }, [access, id])

    // Initial fetch + auto-refresh every 15s
    useEffect(() => {
        if (access !== 'granted') return
        fetchResults()
        const interval = setInterval(fetchResults, 15000)
        return () => clearInterval(interval)
    }, [access, fetchResults])

    // ── PDF Export ─────────────────────────────────────────────────────────────
    const handleExportPDF = () => {
        const totalVotesAll = results?.reduce((acc, s) => acc + (s.totalVotes || 0), 0) ?? 0
        const participation = voterCount > 0 ? ((votedCount / voterCount) * 100).toFixed(1) : 0
        const abstentions = Math.max(0, voterCount - votedCount)

        const sessionsHtml = (results || []).map(session => `
            <h3 style="margin:20px 0 8px; font-size:14px; font-weight:700; color:#0f172a;">${session.title}</h3>
            <table style="width:100%; border-collapse:collapse; margin-bottom:12px;">
                <thead>
                    <tr style="background:#f1f5f9;">
                        <th style="padding:8px 12px; text-align:left; font-size:11px; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:.05em;">Option</th>
                        <th style="padding:8px 12px; text-align:right; font-size:11px; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:.05em;">Voix</th>
                        <th style="padding:8px 12px; text-align:right; font-size:11px; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:.05em;">%</th>
                    </tr>
                </thead>
                <tbody>
                    ${(session.candidates || []).map((c, i) => `
                        <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
                            <td style="padding:8px 12px; font-size:12px; font-weight:600; color:#0f172a;">${c.title}</td>
                            <td style="padding:8px 12px; text-align:right; font-size:12px; font-weight:700; color:#2563eb;">${c.voteCount || 0}</td>
                            <td style="padding:8px 12px; text-align:right; font-size:12px; font-weight:600; color:#64748b;">${c.percentage || 0}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `).join('')

        const html = `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><title>Rapport de scrutin — ${scrutinTitle}</title>
            <style>body { font-family: system-ui, sans-serif; color: #0f172a; padding: 40px; max-width: 900px; margin: 0 auto; }
            @media print { body { padding: 20px; } }</style>
            </head>
            <body>
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; padding-bottom:16px; border-bottom:2px solid #e2e8f0;">
                    <div>
                        <h1 style="font-size:24px; font-weight:900; margin:0 0 4px;">${scrutinTitle}</h1>
                        <p style="font-size:12px; color:#64748b; margin:0;">Rapport de suivi — Modérateur · ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div style="text-align:right;">
                        <p style="font-size:10px; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:.05em;">EpiVote</p>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; margin-bottom:32px;">
                    <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:12px; padding:16px; text-align:center;">
                        <p style="font-size:10px; color:#0284c7; font-weight:700; text-transform:uppercase; letter-spacing:.05em; margin:0 0 6px;">Taux de participation</p>
                        <p style="font-size:28px; font-weight:900; color:#0369a1; margin:0;">${participation}%</p>
                    </div>
                    <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:16px; text-align:center;">
                        <p style="font-size:10px; color:#16a34a; font-weight:700; text-transform:uppercase; letter-spacing:.05em; margin:0 0 6px;">Inscrits</p>
                        <p style="font-size:28px; font-weight:900; color:#15803d; margin:0;">${voterCount}</p>
                    </div>
                    <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:12px; padding:16px; text-align:center;">
                        <p style="font-size:10px; color:#0284c7; font-weight:700; text-transform:uppercase; letter-spacing:.05em; margin:0 0 6px;">Ont voté</p>
                        <p style="font-size:28px; font-weight:900; color:#0369a1; margin:0;">${votedCount}</p>
                    </div>
                    <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:16px; text-align:center;">
                        <p style="font-size:10px; color:#dc2626; font-weight:700; text-transform:uppercase; letter-spacing:.05em; margin:0 0 6px;">Abstentions</p>
                        <p style="font-size:28px; font-weight:900; color:#b91c1c; margin:0;">${abstentions}</p>
                    </div>
                </div>

                <h2 style="font-size:14px; font-weight:900; text-transform:uppercase; letter-spacing:.08em; color:#64748b; margin-bottom:16px;">Résultats par session (${totalVotesAll} votes au total)</h2>
                ${sessionsHtml}

                <p style="font-size:10px; color:#94a3b8; margin-top:40px; padding-top:16px; border-top:1px solid #e2e8f0; text-align:center;">
                    Données issues de la blockchain — non modifiables · Généré via EpiVote
                </p>
            </body>
            </html>
        `
        const win = window.open('', '_blank')
        win.document.write(html)
        win.document.close()
        win.focus()
        setTimeout(() => { win.print(); win.close() }, 800)
        toast.success('Génération du rapport PDF...')
    }

    // ── Not authenticated ──────────────────────────────────────────────────
    if (!user) {
        return (
            <div className="max-w-md mx-auto py-20 px-4 text-center">
                <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 border border-amber-100 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                    <LockClosedIcon className="w-3.5 h-3.5" />
                    Accès modérateur
                </div>
                <h2 className="text-3xl font-black mb-3 tracking-tight">Authentification requise</h2>
                <p className="text-slate-500 mb-2 text-sm leading-relaxed">
                    Ce tableau de bord est réservé aux modérateurs du scrutin. Connectez-vous avec le compte sur lequel vous avez reçu le lien.
                </p>
                <p className="text-slate-400 text-xs mb-8">
                    Une authentification Google ou Microsoft est obligatoire.
                </p>
                <div className="space-y-3">
                    <button
                        onClick={loginWithGoogle}
                        className="w-full h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all font-bold text-[#334155] shadow-sm active:scale-[0.98]"
                    >
                        <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                        Se connecter avec Google
                    </button>
                    <button
                        onClick={loginWithOffice365}
                        className="w-full h-14 bg-[#2563EB] rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all font-bold text-white shadow-md active:scale-[0.98]"
                    >
                        <img src="https://www.microsoft.com/favicon.ico" className="w-5 h-5 brightness-0 invert" alt="Microsoft" />
                        Se connecter avec Office 365
                    </button>
                </div>
            </div>
        )
    }

    // ── Checking access ────────────────────────────────────────────────────
    if (access === 'checking' || access === null) {
        return (
            <div className="py-32 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4" />
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Vérification des droits d'accès...</p>
            </div>
        )
    }

    // ── Access denied ──────────────────────────────────────────────────────
    if (access === 'denied') {
        return (
            <div className="max-w-md mx-auto py-20 px-4 text-center">
                <div className="bg-red-50 text-red-600 p-8 rounded-[40px] border border-red-100 mb-8">
                    <h2 className="text-2xl font-black mb-2">Accès refusé</h2>
                    <p className="font-medium text-sm">
                        L'adresse <strong>{user.email}</strong> n'est pas référencée comme modérateur de ce scrutin.
                    </p>
                </div>
            </div>
        )
    }

    // ── Live report ────────────────────────────────────────────────────────
    const totalVotes = results?.reduce((acc, s) => acc + (s.totalVotes || 0), 0) ?? 0
    const participation = voterCount > 0 ? parseFloat(((votedCount / voterCount) * 100).toFixed(1)) : 0
    const abstentions = Math.max(0, voterCount - votedCount)

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 border border-primary-100 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                        Suivi en direct
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modérateur</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">{scrutinTitle}</h1>
                <p className="text-slate-400 text-sm font-medium">Connecté en tant que <span className="text-primary-500 font-bold">{user.email}</span></p>
            </div>

            {/* Participation stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {/* Gauge */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center">
                    <ParticipationGauge value={participation} max={100} label="Taux de participation" color="#3b82f6" />
                </div>

                {/* Registered voters */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-center">
                    <UserGroupIcon className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Inscrits</p>
                    <p className="text-4xl font-black text-slate-900">{voterCount}</p>
                    <div className="mt-3 flex justify-center gap-2 text-xs">
                        <span className="bg-emerald-100 text-emerald-700 font-black px-2.5 py-1 rounded-xl">{votedCount} ont voté</span>
                    </div>
                </div>

                {/* Abstentions */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Abstentions</p>
                    <p className="text-4xl font-black text-slate-900">{abstentions}</p>
                    <div className="mt-3">
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${voterCount > 0 ? (abstentions / voterCount) * 100 : 0}%` }}
                                transition={{ duration: 1.5 }}
                                className="h-full bg-slate-400 rounded-full"
                            />
                        </div>
                        <p className="text-xs text-slate-400 font-bold mt-1">
                            {voterCount > 0 ? ((abstentions / voterCount) * 100).toFixed(1) : 0}% du collège
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total votes</p>
                    <p className="text-2xl font-black text-primary-600">{totalVotes}</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sessions</p>
                    <p className="text-2xl font-black text-slate-900">{results?.length ?? 0}</p>
                </div>
                <div className="col-span-2 sm:col-span-1 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dernière MAJ</p>
                        <p className="text-sm font-black text-slate-700">{lastRefresh ? lastRefresh.toLocaleTimeString('fr-FR') : '—'}</p>
                    </div>
                    <button
                        onClick={fetchResults}
                        disabled={loadingResults}
                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-40"
                        title="Rafraîchir"
                    >
                        <ArrowPathIcon className={`w-5 h-5 text-slate-500 ${loadingResults ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Results per session */}
            {!results ? (
                <div className="py-20 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Chargement des données...</p>
                </div>
            ) : results.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                    <ChartBarIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucun vote enregistré pour l'instant</p>
                    <p className="text-slate-300 text-xs mt-1">La page se rafraîchit automatiquement toutes les 15 secondes.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {results.map((session, sIdx) => (
                        <div key={session.address || sIdx} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                                <span className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                                    {sIdx + 1}
                                </span>
                                <div>
                                    <h3 className="font-black text-slate-900 tracking-tight">{session.title}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {session.totalVotes} vote{session.totalVotes !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            {(() => {
                                    const maxVotes = Math.max(0, ...(session.candidates || []).map(c => c.voteCount || 0))
                                    return (
                                        <div className="divide-y divide-slate-50">
                                            {(session.candidates || []).map((candidate, cIdx) => {
                                                const pct = candidate.percentage || 0
                                                const isLeading = session.totalVotes > 0 && candidate.voteCount === maxVotes && maxVotes > 0
                                                return (
                                                    <div key={candidate.id ?? cIdx} className="px-6 py-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                {isLeading && (
                                                                    <ShieldSolid className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                                                                )}
                                                                <span className="text-sm font-black text-slate-900">{candidate.title}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs font-black text-slate-700">{candidate.voteCount || 0} voix</span>
                                                                <span className="text-xs font-bold text-slate-400 w-10 text-right">{pct}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${pct}%` }}
                                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                                className="h-full bg-primary-500 rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )
                                })()}
                        </div>
                    ))}
                </div>
            )}

            {/* Export + footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
                    Rafraîchissement automatique toutes les 15 secondes · Données blockchain non modifiables.
                </p>
                <button
                    onClick={handleExportPDF}
                    className="shrink-0 flex items-center gap-2 py-3 px-6 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg whitespace-nowrap"
                >
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    Exporter PDF
                </button>
            </div>
        </div>
    )
}

export default ModeratorReportPage
