import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  HomeIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { ROUTES } from '../../constants/routes'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.HOME)
  }

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to={ROUTES.HOME} className="flex items-center space-x-3">
            <img src="/vite.svg" alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-white">Epitech Vote</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link to={ROUTES.HOME} className="nav-link">
              <HomeIcon className="h-5 w-5" />
              <span>Accueil</span>
            </Link>
            
            <Link to={ROUTES.VOTER} className="nav-link">
              <UserGroupIcon className="h-5 w-5" />
              <span>Voter</span>
            </Link>
            
            <Link to={ROUTES.RESULTS} className="nav-link">
              <ChartBarIcon className="h-5 w-5" />
              <span>Résultats</span>
            </Link>
            
            {user?.role === 'admin' && (
              <Link to={ROUTES.ADMIN.DASHBOARD} className="nav-link">
                <ShieldCheckIcon className="h-5 w-5" />
                <span>Admin</span>
              </Link>
            )}
            
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-gray-300">
                  <UserCircleIcon className="h-5 w-5" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="nav-link text-red-400 hover:text-red-300"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link to={ROUTES.LOGIN} className="btn-primary">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .nav-link {
          @apply flex items-center space-x-1 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors;
        }
      `}</style>
    </nav>
  )
}

export default Navbar