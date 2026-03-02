import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useElections } from '../../contexts/ElectionContext'
import { useAuth } from '../../contexts/AuthContext'
import { useSettings } from '../../contexts/SettingsContext'
import {
  PlusIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  ChevronRightIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import Card from '../common/Card'
import Button from '../common/Button'
import { useState } from 'react'

const AdminDashboard = () => {
  const { elections } = useElections()
  const { user } = useAuth()
  const { t } = useSettings()
  const navigate = useNavigate()

  const stats = {
    totalElections: elections.length,
    activeElections: elections.filter(e => {
      const now = new Date()
      return now >= new Date(e.startDate) && now <= new Date(e.endDate)
    }).length,
    pendingValidations: 0
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const getStatus = (election) => {
    const now = new Date()
    const start = new Date(election.startDate)
    const end = new Date(election.endDate)

    if (election.status === 'pending') return 'pending'
    if (election.timingMode === 'manual') return 'Manuall'
    if (now < start) return 'not started'
    if (now > end) return 'finished'
    return 'Actif'
  }

  const filteredElections = elections
    .filter(e => {
      const status = getStatus(e)
      const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))

  const handleRowClick = (id) => {
    navigate(`/admin/elections/${id}`)
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            {t({ fr: 'Tableau de bord', en: 'Dashboard' })}
          </h1>
          <p className="text-slate-500 font-medium">{t({ fr: 'Gestion de vos sessions et scrutins', en: 'Manage your sessions and ballots' })}</p>
        </div>
        <div className="flex gap-4">
          <Link to="/voter">
            <Button variant="outline" className="h-14 px-8 rounded-2xl text-lg border-slate-200">
              <UserGroupIcon className="h-6 w-6 mr-3" />
              {t({ fr: 'Lancer un vote', en: 'Start Vote' })}
            </Button>
          </Link>
          <Link to="/admin/elections/new">
            <Button className="shadow-lg shadow-primary-500/20 h-14 px-8 rounded-2xl text-lg group">
              <PlusIcon className="h-6 w-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
              {t({ fr: 'Nouveau Scrutin', en: 'New Ballot' })}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-white border-slate-100 hover:border-primary-100 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Total scrutins</p>
              <p className="text-4xl font-black text-slate-900">{stats.totalElections}</p>
            </div>
            <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center">
              <DocumentCheckIcon className="h-6 w-6 text-slate-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-100 hover:border-primary-100 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-primary-600 text-xs font-black uppercase tracking-widest mb-1">En cours</p>
              <p className="text-4xl font-black text-slate-900">{stats.activeElections}</p>
            </div>
            <div className="h-12 w-12 bg-primary-50 rounded-2xl flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-100 hover:border-secondary-100 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-secondary-600 text-xs font-black uppercase tracking-widest mb-1">En attente (Modérateurs)</p>
              <p className="text-4xl font-black text-slate-900">{stats.pendingValidations}</p>
            </div>
            <div className="h-12 w-12 bg-secondary-50 rounded-2xl flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une session..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium text-slate-900 shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold text-slate-700 shadow-sm appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="not started">Non démarré</option>
            <option value="Manuall">Manuel</option>
            <option value="finished">Terminé</option>
          </select>
        </div>
      </div>

      {/* Recent Elections List */}
      <div>
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Vos sessions récentes</h2>
        <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden">
          {filteredElections.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-slate-500 font-medium mb-6">Aucun scrutin correspondant trouvé.</p>
              {searchQuery || statusFilter !== 'all' ? (
                <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>Réinitialiser les filtres</Button>
              ) : (
                <Link to="/admin/elections/new">
                  <Button variant="outline">Créer votre premier scrutin</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredElections.map(election => {
                const now = new Date()
                const start = new Date(election.startDate)
                const end = new Date(election.endDate)

                let statusLabel = 'Terminé'
                let statusClasses = 'bg-slate-50 text-slate-600 border-slate-200'

                const currentStatus = getStatus(election)

                if (currentStatus === 'not started') {
                  statusLabel = 'Pas encore commencé'
                  statusClasses = 'bg-amber-50 text-amber-700 border-amber-200'
                } else if (currentStatus === 'pending') {
                  statusLabel = 'En attente'
                  statusClasses = 'bg-blue-50 text-blue-700 border-blue-200'
                } else if (currentStatus === 'Manuall') {
                  statusLabel = 'Manuel'
                  statusClasses = 'bg-purple-50 text-purple-700 border-purple-200'
                } else if (now >= start && now <= end) {
                  statusLabel = 'En cours'
                  statusClasses = 'bg-primary-50 text-primary-700 border-primary-200'
                }

                return (
                  <div
                    key={election.id}
                    onClick={() => handleRowClick(election.id)}
                    className="p-6 md:p-8 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-primary-600 transition-colors">{election.title}</h3>
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${statusClasses}`}>
                          {statusLabel}
                        </span>
                        {election.scope && (
                          <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border bg-slate-100 text-slate-500 border-slate-200">
                            {election.scope}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 font-medium line-clamp-1 max-w-2xl">{election.description}</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Période</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {start.toLocaleDateString()} - {end.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="hidden md:flex items-center justify-center h-10 w-10 bg-white rounded-full border border-slate-200 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all">
                        <ChevronRightIcon className="h-5 w-5 text-slate-400 group-hover:text-primary-600" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard