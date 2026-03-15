import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useElections } from '../../contexts/ElectionContext'
import Card from '../common/Card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ScatterChart, Scatter, ZAxis
} from 'recharts'
import {
  TrophyIcon, UserGroupIcon, ClockIcon, CheckBadgeIcon,
  ArrowTrendingUpIcon, ChevronDownIcon, ChevronUpIcon, SparklesIcon
} from '@heroicons/react/24/outline'

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']
const RANK_MEDALS = ['🥇', '🥈', '🥉']

// ─── Participation Gauge (semi-arc) ──────────────────────────────────────────
const ParticipationGauge = ({ value, label, color = '#3b82f6', max = 100 }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const radius = 52
  const circ = Math.PI * radius // semi-circle
  const dashOffset = circ - (pct / 100) * circ

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-20 overflow-hidden">
        <svg viewBox="0 0 120 65" className="w-full h-full" style={{ transform: 'scaleY(1)' }}>
          {/* Background arc */}
          <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
          {/* Value arc */}
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
            style={{ pathLength: 1 }}
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

// ─── Kahoot-style Leaderboard Row ─────────────────────────────────────────────
const LeaderboardRow = ({ candidate, rank, voteCount, totalVotes, color, isExpanded, onToggle }) => {
  const pct = totalVotes > 0 ? ((voteCount / totalVotes) * 100) : 0
  const isLeader = rank === 0
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.08 }}
      className={`rounded-2xl overflow-hidden border-2 transition-all duration-300 ${isLeader ? 'border-amber-300 shadow-lg shadow-amber-100' : 'border-slate-100'}`}
    >
      <div
        className={`flex items-center gap-3 sm:gap-5 p-4 cursor-pointer ${isLeader ? 'bg-gradient-to-r from-amber-50 to-yellow-50' : 'bg-white hover:bg-slate-50'}`}
        onClick={onToggle}
      >
        {/* Rank Badge */}
        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg font-black ${isLeader ? 'bg-amber-400 shadow-lg shadow-amber-200' : 'bg-slate-100'}`}>
          {rank < 3 ? RANK_MEDALS[rank] : <span className="text-sm text-slate-500">{rank + 1}</span>}
        </div>

        {/* Logo */}
        <div className={`w-12 h-12 shrink-0 rounded-xl border-2 ${isLeader ? 'border-amber-200' : 'border-slate-100'} overflow-hidden bg-white flex items-center justify-center shadow-sm`}>
          {candidate.imageUrl
            ? <img src={candidate.imageUrl} alt={candidate.title} className="w-full h-full object-cover" />
            : <span className="text-lg font-black text-slate-300">{(candidate.title || '?')[0]}</span>
          }
        </div>

        {/* Name + Bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className={`font-black tracking-tight truncate ${isLeader ? 'text-amber-800 text-base' : 'text-slate-900 text-sm'}`}>
              {candidate.title || candidate.name}
            </h4>
            <span className={`ml-3 shrink-0 font-black text-right ${isLeader ? 'text-2xl text-amber-600' : 'text-xl text-slate-700'}`}>
              {voteCount} <span className="text-xs font-bold text-slate-400">voix</span>
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: rank * 0.08 }}
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] font-bold text-slate-400">{pct.toFixed(1)}% des votes</span>
          </div>
        </div>

        {/* Expand toggle */}
        <div className="shrink-0 text-slate-400">
          {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 px-5 py-4 bg-slate-50/60"
          >
            {candidate.description
              ? <p className="text-sm text-slate-600 font-medium leading-relaxed italic border-l-2 pl-3 border-primary-300">"{candidate.description}"</p>
              : <p className="text-xs text-slate-400 italic">Aucune description.</p>
            }
            {candidate.members && candidate.members.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {candidate.members.map((m, mi) => (
                  <span key={mi} className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700">
                    {m.photoUrl && <img src={m.photoUrl} alt="" className="w-4 h-4 rounded-full object-cover" />}
                    {m.name}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Statistics Component ────────────────────────────────────────────────
const Statistics = () => {
  const { elections } = useElections()
  const [selectedElection, setSelectedElection] = useState('')
  const [selectedSession, setSelectedSession] = useState(0)
  const [expandedPart, setExpandedPart] = useState(null)

  const election = elections.find(e => e.id === selectedElection)
  const sessions = election?.sessions || []
  const currentSession = sessions[selectedSession] || sessions[0]
  const candidates = currentSession?.candidates || currentSession?.options || []

  const currentSessionVotes = currentSession?.votes || {}
  const totalVotesCast = Object.values(currentSessionVotes).reduce((a, b) => a + (parseInt(b) || 0), 0)

  const electionStats = election ? {
    totalVotes: Object.values(election.votes || {}).reduce((a, b) => a + (parseInt(b) || 0), 0),
    voterCount: election.voterCount || 0,
    votedCount: election.votedCount || 0,
    participation: election.voterCount > 0
      ? parseFloat(((election.votedCount / election.voterCount) * 100).toFixed(1))
      : 0,
    abstentions: Math.max(0, (election.voterCount || 0) - (election.votedCount || 0))
  } : null

  // Build time series: convert time strings to numeric minutes-since-midnight for X axis
  const timeData = (election?.timeSeries || [])
    .filter(pt => pt.time && pt.time !== '00:00') // skip placeholder
    .map(pt => {
      const [h, m] = (pt.time || '00:00').split(':').map(Number)
      return {
        ...pt,
        x: h * 60 + m, // numeric X: minutes since midnight
        y: (election.sessions.findIndex(s => s.address === pt.sessionId) * 0.3) + pt.optionIndex + 1,
        color: COLORS[pt.optionIndex % COLORS.length]
      }
    })

  // Sorted candidates for leaderboard
  const sortedCandidates = candidates.map((c, i) => ({ ...c, originalIndex: i }))
    .sort((a, b) => (currentSessionVotes[b.originalIndex] || 0) - (currentSessionVotes[a.originalIndex] || 0))

  return (
    <div className="max-w-5xl mx-auto animate-fade-in px-4 sm:px-0">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          {election?.logoUrl && (
            <div className="h-14 w-14 bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden flex items-center justify-center p-1.5 shrink-0">
              <img src={election.logoUrl} alt="Logo" className="h-full w-full object-contain" />
            </div>
          )}
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Rapports</h1>
            <p className="text-slate-500 font-medium text-sm mt-0.5">
              {election ? election.title : 'Sélectionnez un scrutin pour analyser.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* ── Scrutin Selector ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <select value={selectedElection} onChange={e => { setSelectedElection(e.target.value); setSelectedSession(0) }}
          className="flex-1 px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-primary-500 font-bold appearance-none shadow-sm text-sm">
          <option value="">Tous les scrutins récents</option>
          {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        {election && sessions.length > 1 && (
          <select value={selectedSession} onChange={e => setSelectedSession(parseInt(e.target.value))}
            className="sm:w-64 px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-primary-500 font-bold appearance-none shadow-sm text-sm">
            {sessions.map((s, idx) => <option key={idx} value={idx}>{s.title || `Session ${idx + 1}`}</option>)}
          </select>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — LEADERBOARD (Kahoot-style) — PRIMARY
      ═══════════════════════════════════════════════════════════════════ */}
      {election && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <TrophyIcon className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Classement en temps réel</h2>
            <span className="ml-auto text-[10px] font-black bg-amber-100 text-amber-700 px-3 py-1 rounded-full uppercase tracking-wide">{totalVotesCast} vote(s) scellé(s)</span>
          </div>

          {sortedCandidates.length > 0 ? (
            <div className="space-y-3">
              {sortedCandidates.map((candidate, rank) => (
                <LeaderboardRow
                  key={candidate.originalIndex}
                  candidate={candidate}
                  rank={rank}
                  voteCount={currentSessionVotes[candidate.originalIndex] || 0}
                  totalVotes={totalVotesCast}
                  color={COLORS[candidate.originalIndex % COLORS.length]}
                  isExpanded={expandedPart === candidate.originalIndex}
                  onToggle={() => setExpandedPart(expandedPart === candidate.originalIndex ? null : candidate.originalIndex)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-100">
              <SparklesIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-bold">Aucune option n'a encore reçu de votes.</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2 — JAUGES DE PARTICIPATION — PRIMARY
      ═══════════════════════════════════════════════════════════════════ */}
      {election && electionStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <Card className="p-6 bg-white border-slate-100 shadow-sm rounded-3xl flex flex-col items-center justify-center">
            <ParticipationGauge value={electionStats.participation} max={100} label="Taux de Participation" color="#3b82f6" />
          </Card>
          <Card className="p-6 bg-white border-slate-100 shadow-sm rounded-3xl text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Inscrits Totaux</p>
            <p className="text-5xl font-black text-slate-900">{electionStats.voterCount}</p>
            <div className="mt-3 flex justify-center gap-3 text-xs">
              <span className="bg-emerald-100 text-emerald-700 font-black px-2.5 py-1 rounded-xl">{electionStats.votedCount} ont voté</span>
            </div>
          </Card>
          <Card className="p-6 bg-white border-slate-100 shadow-sm rounded-3xl text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Abstentions</p>
            <p className="text-5xl font-black text-slate-900">{electionStats.abstentions}</p>
            <div className="mt-3">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${electionStats.voterCount > 0 ? (electionStats.abstentions / electionStats.voterCount) * 100 : 0}%` }}
                  transition={{ duration: 1.5 }}
                  className="h-full bg-slate-400 rounded-full"
                />
              </div>
              <p className="text-xs text-slate-400 font-bold mt-1">
                {electionStats.voterCount > 0 ? ((electionStats.abstentions / electionStats.voterCount) * 100).toFixed(1) : 0}% du collège
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* ── Global Summary Cards (always visible) ─────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Scrutins', value: elections.length, icon: CheckBadgeIcon, color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Votes Total', value: elections.reduce((acc, e) => acc + Object.values(e.votes || {}).reduce((a, b) => a + (parseInt(b) || 0), 0), 0), icon: UserGroupIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Sessions Actives', value: elections.filter(e => { const now = new Date(); return now >= new Date(e.startDate) && now <= new Date(e.endDate) }).length, icon: ClockIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Participation Scrutin', value: election ? `${electionStats.participation}%` : '—', icon: TrophyIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' }
        ].map((stat, i) => (
          <motion.div key={i} whileHover={{ y: -3 }} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 right-0 h-16 w-16 ${stat.bg} rounded-full -mr-6 -mt-6 opacity-60`} />
            <stat.icon className={`h-6 w-6 ${stat.color} mb-3 relative z-10`} />
            <p className="text-2xl sm:text-3xl font-black text-slate-900 relative z-10">{stat.value}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 relative z-10">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3 — ÉVOLUTION TEMPORELLE — SECONDARY
      ═══════════════════════════════════════════════════════════════════ */}
      <Card className="bg-white border-slate-100 shadow-sm rounded-3xl p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <ArrowTrendingUpIcon className="w-5 h-5 text-primary-600" />
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Évolution temporelle</h2>
          <span className="text-[10px] text-slate-400 font-medium ml-auto italic">Nuage de points, chaque couleur = 1 parti</span>
        </div>
        {timeData.length >= 1 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="x"
                  type="number"
                  name="Heure"
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => {
                    const h = Math.floor(v / 60).toString().padStart(2, '0')
                    const m = (v % 60).toString().padStart(2, '0')
                    return `${h}:${m}`
                  }}
                  stroke="#94a3b8"
                  fontSize={9}
                  fontWeight="700"
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Heure du vote', position: 'insideBottom', offset: -10, fontSize: 9, fill: '#94a3b8', fontWeight: 700 }}
                />
                <YAxis dataKey="y" domain={[0, 7]} hide />
                <ZAxis type="number" range={[60, 200]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      const d = payload[0].payload
                      const cand = candidates[d.optionIndex]
                      const h = Math.floor(d.x / 60).toString().padStart(2, '0')
                      const mn = (d.x % 60).toString().padStart(2, '0')
                      return (
                        <div className="bg-white rounded-2xl p-3 shadow-xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{h}:{mn}</p>
                          <p className="font-black text-sm">{cand?.title || cand?.name || `Option ${d.optionIndex + 1}`}</p>
                          <p className="text-[10px] font-bold text-primary-600">Vote enregistré</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                {candidates.map((c, idx) => (
                  <Scatter key={idx} name={c.name || c.title} data={timeData.filter(d => d.optionIndex === idx)} fill={COLORS[idx % COLORS.length]} opacity={0.85} />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex flex-col items-center justify-center gap-3 text-center bg-slate-50 rounded-2xl">
            <ArrowTrendingUpIcon className="w-8 h-8 text-slate-200" />
            <p className="text-sm text-slate-400 font-bold">Aucune donnée temporelle disponible.</p>
            <p className="text-xs text-slate-300">Les données apparaissent au fur et à mesure des votes.</p>
          </div>
        )}
        {/* Legend */}
        {candidates.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100">
            {candidates.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] font-bold text-slate-600">{c.title || c.name}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Export Button ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <p className="text-xs text-slate-500 font-medium leading-relaxed text-center sm:text-left">
          Les données proviennent directement des hachages stockés sur la blockchain — non modifiables.
        </p>
        <button
          onClick={() => { toast.success('Génération du rapport PDF...'); setTimeout(() => window.print(), 1000) }}
          className="shrink-0 py-3 px-6 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg whitespace-nowrap">
          Exporter PDF/CSV
        </button>
      </div>
    </div>
  )
}

export default Statistics