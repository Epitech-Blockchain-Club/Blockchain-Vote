import React, { useState } from 'react'
import ElectionCard from './ElectionCard'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'

const ElectionList = ({ elections }) => {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filteredElections = elections.filter(election => {
    const matchesSearch = election.title.toLowerCase().includes(search.toLowerCase()) ||
      election.description?.toLowerCase().includes(search.toLowerCase())

    if (filter === 'all') return matchesSearch
    if (filter === 'active') {
      const now = new Date()
      return now >= new Date(election.startDate) && now <= new Date(election.endDate) && matchesSearch
    }
    if (filter === 'upcoming') {
      return new Date() < new Date(election.startDate) && matchesSearch
    }
    if (filter === 'ended') {
      return new Date() > new Date(election.endDate) && matchesSearch
    }
    return matchesSearch
  })

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une élection..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium appearance-none cursor-pointer"
          >
            <option value="all">Toutes les élections</option>
            <option value="active">Élections en cours</option>
            <option value="upcoming">Prochaines élections</option>
            <option value="ended">Élections terminées</option>
          </select>
        </div>
      </div>

      {filteredElections.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-500 font-medium">Aucune élection ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredElections.map(election => (
            <ElectionCard key={election.id} election={election} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ElectionList