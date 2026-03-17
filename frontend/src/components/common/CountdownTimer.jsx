import React, { useState, useEffect } from 'react'
import { ClockIcon, LockOpenIcon, LockClosedIcon } from '@heroicons/react/24/outline'

const pad = (n) => String(n).padStart(2, '0')

const diff = (target) => {
  const ms = new Date(target) - new Date()
  if (ms <= 0) return null
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  }
}

const formatDateTime = (date) => {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const CountdownTimer = ({ startDate, endDate, targetDate, onComplete }) => {
  const start = startDate || null
  const end = endDate || targetDate || null

  const getState = () => {
    const now = new Date()
    if (start && now < new Date(start)) return 'pending'
    if (end && now <= new Date(end)) return 'open'
    return 'closed'
  }

  const [state, setState] = useState(getState)
  const [timeLeft, setTimeLeft] = useState(() => {
    const s = getState()
    return s === 'pending' ? diff(start) : s === 'open' ? diff(end) : null
  })

  useEffect(() => {
    const tick = () => {
      const s = getState()
      setState(s)
      if (s === 'pending') setTimeLeft(diff(start))
      else if (s === 'open') setTimeLeft(diff(end))
      else { setTimeLeft(null); onComplete?.() }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [start, end])

  if (state === 'closed') {
    return (
      <div className="flex items-center gap-3 p-4 bg-slate-100 rounded-2xl">
        <LockClosedIcon className="h-5 w-5 text-slate-400 shrink-0" />
        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Scrutin terminé</span>
      </div>
    )
  }

  const isPending = state === 'pending'
  const label = isPending ? "Ouverture dans" : "Fermeture dans"
  const color = isPending ? 'text-amber-600' : 'text-primary-600'
  const bg = isPending ? 'bg-amber-50 border-amber-100' : 'bg-primary-50 border-primary-100'
  const Icon = isPending ? LockOpenIcon : LockClosedIcon

  return (
    <div className={`rounded-2xl border p-5 ${bg}`}>
      {/* Dates ligne */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {start && (
          <div className="flex-1 bg-white rounded-xl px-4 py-3 border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Ouverture</p>
            <p className="text-sm font-bold text-slate-800">{formatDateTime(start)}</p>
          </div>
        )}
        {end && (
          <div className="flex-1 bg-white rounded-xl px-4 py-3 border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Fermeture</p>
            <p className="text-sm font-bold text-slate-800">{formatDateTime(end)}</p>
          </div>
        )}
      </div>

      {/* Compte à rebours */}
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 shrink-0 ${color}`} />
        <p className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{label}</p>
        <div className="flex gap-2 ml-auto">
          {timeLeft?.days > 0 && (
            <div className="text-center">
              <span className={`text-2xl font-black ${color}`}>{timeLeft.days}</span>
              <span className="text-[10px] text-slate-400 ml-0.5">j</span>
            </div>
          )}
          {[['hours', 'h'], ['minutes', 'm'], ['seconds', 's']].map(([key, unit]) => (
            <div key={key} className="text-center">
              <span className={`text-2xl font-black ${color}`}>{pad(timeLeft?.[key] ?? 0)}</span>
              <span className="text-[10px] text-slate-400 ml-0.5">{unit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CountdownTimer
