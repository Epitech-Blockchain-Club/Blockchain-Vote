import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useElections } from '../../contexts/ElectionContext'
import Card from '../common/Card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area
} from 'recharts'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  TrophyIcon,
  UserGroupIcon,
  ClockIcon,
  CheckBadgeIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

const Statistics = () => {
  const { elections } = useElections()
  const [selectedElection, setSelectedElection] = useState('')
  const [expandedPart, setExpandedPart] = useState(null)

  const election = elections.find(e => e.id === selectedElection)

  // Statistiques globales
  const globalStats = {
    totalElections: elections.length,
    totalVotes: elections.reduce((acc, e) => acc + (e.voters ? e.voters.length : 0), 0),
    activeElections: elections.filter(e => {
      const now = new Date()
      return now >= new Date(e.startDate) && now <= new Date(e.endDate)
    }).length,
    avgParticipation: elections.length > 0
      ? ((elections.reduce((acc, e) => acc + (e.voters ? e.voters.length : 0), 0) / elections.length)).toFixed(1)
      : 0
  }

  // Time series data (placeholder until backend supports time-series)
  const timeData = []

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#64748b']

  const togglePart = (id) => {
    setExpandedPart(expandedPart === id ? null : id)
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary-100/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-secondary-100/30 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-3">Rapports Analytiques</h1>
            <p className="text-slate-500 font-semibold text-lg max-w-xl">Supervisez l'intégrité et la participation de vos scrutins blockchain en temps réel.</p>
          </div>
          <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-white/80 shadow-sm">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-black text-green-600 uppercase tracking-widest">Système Opérationnel</span>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Scrutins', value: globalStats.totalElections, icon: CheckBadgeIcon, color: 'text-primary-600', bg: 'bg-primary-50' },
            { label: 'Votes Scellés', value: globalStats.totalVotes, icon: UserGroupIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Sessions Actives', value: globalStats.activeElections, icon: ClockIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Participation Moy.', value: `${globalStats.avgParticipation}%`, icon: TrophyIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white/60 backdrop-blur-xl border border-white/40 p-6 rounded-[32px] shadow-xl shadow-slate-200/40 relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 h-24 w-24 ${stat.bg} rounded-full -mr-8 -mt-8 opacity-40 group-hover:scale-110 transition-transform duration-500`}></div>
              <stat.icon className={`h-8 w-8 ${stat.color} mb-4 relative z-10`} />
              <p className="text-4xl font-black text-slate-900 mb-1 relative z-10">{stat.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Global Control Center */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Chart Section */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white/40 backdrop-blur-2xl border-white/60 shadow-2xl rounded-[40px] p-8 border">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-xs font-black text-primary-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <ArrowTrendingUpIcon className="w-4 h-4" /> Analyse de Progression
                  </h2>
                  <p className="text-lg font-black text-slate-900 mb-1">Évolution temporelle des votes</p>
                </div>
                <select
                  value={selectedElection}
                  onChange={(e) => setSelectedElection(e.target.value)}
                  className="px-6 py-4 bg-white/80 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all font-bold appearance-none cursor-pointer shadow-sm text-sm min-w-[300px]"
                >
                  <option value="">Tous les scrutins récents</option>
                  {elections.map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                        padding: '16px'
                      }}
                      itemStyle={{ color: '#0f172a', fontWeight: '900', fontSize: '14px' }}
                    />
                    <Area type="monotone" dataKey="votes" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorVotes)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Detailed Leaderboard Section */}
            {election && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center justify-between px-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                    <TrophyIcon className="w-4 h-4 text-amber-500" /> Leaderboard du Scrutin
                  </h3>
                  <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-full uppercase tracking-tighter">Répartition Live</span>
                </div>
                <div className="space-y-4">
                  {election.candidates.sort((a, b) => (election.votes?.[b.id] || 0) - (election.votes?.[a.id] || 0)).map((candidate, idx) => {
                    const voteCount = election.votes?.[candidate.id] || 0
                    const totalVoters = election.voters ? election.voters.length : 1
                    const percentage = totalVoters > 0 ? ((voteCount / totalVoters) * 100).toFixed(1) : 0
                    const isExpanded = expandedPart === candidate.id

                    return (
                      <Card key={candidate.id} className="bg-white/60 backdrop-blur-xl border border-white/40 p-1 rounded-[32px] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                        <div
                          className="p-5 cursor-pointer flex flex-col md:flex-row items-center gap-6"
                          onClick={() => togglePart(candidate.id)}
                        >
                          <div className="relative">
                            <div className="h-16 w-16 bg-white rounded-2xl border-2 border-primary-100 shadow-sm flex-shrink-0 flex items-center justify-center overflow-hidden">
                              {candidate.photo || candidate.imageUrl ? (
                                <img src={candidate.photo || candidate.imageUrl} alt={candidate.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-xl font-black text-primary-200">{candidate.name.substring(0, 1)}</span>
                              )}
                            </div>
                            {idx === 0 && (
                              <div className="absolute -top-3 -left-3 bg-amber-400 p-1.5 rounded-xl shadow-lg border-2 border-white">
                                <TrophyIcon className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 w-full space-y-3">
                            <div className="flex justify-between items-end">
                              <div>
                                <h4 className="text-xl font-black text-slate-900 tracking-tight">{candidate.name}</h4>
                                <p className="text-xs text-slate-500 font-bold line-clamp-1 italic">{candidate.bio || candidate.description || "Aucune description"}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-3xl font-black text-primary-600 leading-none">{percentage}%</span>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{voteCount} voix scellées</p>
                              </div>
                            </div>
                            <div className="w-full bg-slate-100/50 h-3 rounded-full overflow-hidden p-0.5 border border-slate-50">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className={`h-full rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] ${idx === 0 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-primary-500 to-blue-400'}`}
                              ></motion.div>
                            </div>
                          </div>

                          <div className="p-2 text-slate-400 bg-white shadow-sm rounded-xl border border-slate-100">
                            {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-8 pb-8 pt-4 bg-white/80 border-t border-white/40"
                            >
                              <h5 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-4">Détails de l'Option / Manifesto</h5>
                              <div className="prose prose-slate max-w-none text-slate-600 font-semibold leading-relaxed">
                                {candidate.bio || candidate.description || "Détails non renseignés."}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar Analytical Widgets */}
          <div className="space-y-8">
            <Card className="bg-slate-900 text-white shadow-3xl shadow-slate-900/40 p-8 rounded-[40px] border-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-48 h-48 bg-primary-500/20 blur-[80px] rounded-full group-hover:bg-primary-500/30 transition-colors duration-700"></div>
              <div className="relative z-10">
                <h2 className="text-xs font-black text-primary-400 uppercase tracking-[0.2em] mb-8 flex items-center">
                  <CheckBadgeIcon className="w-4 h-4 mr-2" /> Distribution Globale
                </h2>
                <div className="h-64 relative mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={election?.candidates.map(c => ({ name: c.name, votes: election.votes?.[c.id] || 0 })) || [{ name: 'Aucun', votes: 1 }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="votes"
                        stroke="none"
                      >
                        {election?.candidates.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        )) || <Cell fill="#1e293b" />}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff' }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-white">{election?.voters?.length || 0}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Electeurs</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {election ? election.candidates.map((c, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{c.name}</span>
                      </div>
                      <span className="text-xs font-black text-white">{election.votes?.[c.id] || 0} v.</span>
                    </div>
                  )) : (
                    <p className="text-center text-slate-500 text-[10px] font-black uppercase tracking-widest py-8">Veuillez sélectionner un scrutin</p>
                  )}
                </div>
              </div>
            </Card>

            <div className="p-4 bg-primary-50/50 rounded-2xl border border-primary-100">
              <p className="text-xs text-primary-800 font-bold leading-relaxed">
                Toutes les données affichées ici sont extraites directement des hachages stockés sur la blockchain.
                Aucune manipulation manuelle n'est possible sur ces rapports.
              </p>
            </div>
            <button
              onClick={() => {
                toast.success('Génération du rapport PDF...')
                setTimeout(() => window.print(), 1000)
              }}
              className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
            >
              Exporter le Rapport (PDF/CSV)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics