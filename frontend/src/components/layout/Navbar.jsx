import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { ROUTES } from '../../constants/routes'
import epitechLogo from '../../assets/epitech-logo.png'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate(ROUTES.HOME)
  }

  const navLinks = [
    { name: 'Accueil', path: ROUTES.HOME, icon: HomeIcon },
    { name: 'Voter', path: ROUTES.VOTER, icon: UserGroupIcon },
    { name: 'Résultats', path: ROUTES.RESULTS, icon: ChartBarIcon },
  ]

  if (user?.role === 'admin') {
    navLinks.push({ name: 'Admin', path: ROUTES.ADMIN.DASHBOARD, icon: ShieldCheckIcon })
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 py-3 shadow-2xl shadow-indigo-500/10'
        : 'bg-transparent py-5'
      }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center space-x-3 group outline-none">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <img src={epitechLogo} alt="Epitech Logo" className="relative h-10 w-auto object-contain transition-transform group-hover:scale-110" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tighter leading-none">VOTE</span>
              <span className="text-[10px] font-bold text-indigo-400 tracking-[0.2em] uppercase">Blockchain Hub</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : ''}`} />
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                  )}
                </Link>
              )
            })}

            <div className="h-6 w-px bg-slate-800 mx-3"></div>

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 pl-2 pr-4 py-1.5 rounded-full">
                  <div className="h-7 w-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                    {user.email.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-slate-300 max-w-[120px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  title="Déconnexion"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <Link to={ROUTES.LOGIN} className="btn-primary transform scale-90">
                Connexion
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 overflow-hidden transition-all duration-500 ${isMobileMenuOpen ? 'max-h-[500px] border-b border-slate-800 bg-slate-950/95 backdrop-blur-2xl' : 'max-h-0'
        }`}>
        <div className="px-4 py-6 space-y-3">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-4 p-4 rounded-2xl transition-all ${isActive ? 'bg-indigo-500/10 text-white border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-900'
                  }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? 'text-indigo-400' : ''}`} />
                <span className="text-lg font-bold">{link.name}</span>
              </Link>
            )
          })}

          <div className="pt-4 border-t border-slate-800">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4">
                  <UserCircleIcon className="h-8 w-8 text-indigo-400" />
                  <span className="text-white font-medium">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 p-4 bg-red-500/10 text-red-500 rounded-2xl font-bold"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            ) : (
              <Link
                to={ROUTES.LOGIN}
                className="btn-primary w-full text-center block py-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar