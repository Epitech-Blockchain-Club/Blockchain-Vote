import React from 'react'
import { Link } from 'react-router-dom'
import { useElections } from '../../contexts/ElectionContext'
import { useAuth } from '../../contexts/AuthContext'
import { 
  PlusIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import Card from '../common/Card'
import Button from '../common/Button'

const AdminDashboard = () => {
  const { elections } = useElections()
  const { user } = useAuth()

  const stats = {
    totalElections: elections.length,
    activeElections: elections.filter(e => {
      const now = new Date()
      return now >= new Date(e.startDate) && now <= new Date(e.endDate)
    }).length,
    totalVoters: elections.reduce((acc, e) => acc + (e.voters?.length || 0), 0),
    totalCandidates: elections.reduce((acc, e) => acc + (e.candidates?.length || 0), 0)
  }

  const recentElections = [...elections]
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    .slice(0, 5)

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">
          Dashboard Admin
        </h1>
        <Link to="/admin/elections/new">
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouvelle élection
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <CalendarIcon className="h-8 w-8 text-primary-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-white">{stats.totalElections}</p>
          <p className="text-gray-400">Total élections</p>
        </Card>
        
        <Card className="text-center">
          <ChartBarIcon className="h-8 w-8 text-green-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-white">{stats.activeElections}</p>
          <p className="text-gray-400">Élections en cours</p>
        </Card>
        
        <Card className="text-center">
          <UserGroupIcon className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-white">{stats.totalVoters}</p>
          <p className="text-gray-400">Votes exprimés</p>
        </Card>
        
        <Card className="text-center">
          <DocumentTextIcon className="h-8 w-8 text-purple-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-white">{stats.totalCandidates}</p>
          <p className="text-gray-400">Candidats</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-xl font-semibold text-white mb-4">Actions rapides</h2>
          <div className="space-y-3">
            <Link to="/admin/elections/new" className="block">
              <Button variant="outline" className="w-full">Créer une élection</Button>
            </Link>
            <Link to="/admin/voters" className="block">
              <Button variant="outline" className="w-full">Gérer les électeurs</Button>
            </Link>
            <Link to="/admin/statistics" className="block">
              <Button variant="outline" className="w-full">Voir les statistiques</Button>
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-white mb-4">Informations</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Administrateur</span>
              <span className="text-white">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Réseau blockchain</span>
              <span className="text-white">Polygon Mumbai (Simulation)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dernière activité</span>
              <span className="text-white">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Elections */}
      <Card>
        <h2 className="text-xl font-semibold text-white mb-4">Élections récentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 text-gray-400">Titre</th>
                <th className="text-left py-3 text-gray-400">Début</th>
                <th className="text-left py-3 text-gray-400">Fin</th>
                <th className="text-left py-3 text-gray-400">Statut</th>
                <th className="text-left py-3 text-gray-400">Votes</th>
                <th className="text-left py-3 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentElections.map(election => {
                const now = new Date()
                const start = new Date(election.startDate)
                const end = new Date(election.endDate)
                
                let status = 'Terminée'
                let statusColor = 'text-gray-400'
                
                if (now < start) {
                  status = 'À venir'
                  statusColor = 'text-yellow-400'
                } else if (now <= end) {
                  status = 'En cours'
                  statusColor = 'text-green-400'
                }

                return (
                  <tr key={election.id} className="border-b border-gray-700">
                    <td className="py-3 text-white">{election.title}</td>
                    <td className="py-3 text-gray-300">{start.toLocaleDateString()}</td>
                    <td className="py-3 text-gray-300">{end.toLocaleDateString()}</td>
                    <td className={`py-3 ${statusColor}`}>{status}</td>
                    <td className="py-3 text-white">{election.voters?.length || 0}</td>
                    <td className="py-3">
                      <Link to={`/admin/elections/${election.id}/edit`}>
                        <Button size="sm" variant="outline">Modifier</Button>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default AdminDashboard