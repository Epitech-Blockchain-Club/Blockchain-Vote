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
  XMarkIcon,
  LanguageIcon,
  BellIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { ROUTES } from '../../constants/routes'
import epitechLogo from '../../assets/epitech-logo.png'
import { useSettings } from '../../contexts/SettingsContext'
import Modal from '../common/Modal'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { language, toggleLanguage, t } = useSettings()
  const navigate = useNavigate()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notifLoading, setNotifLoading] = useState(true)
  const API_BASE = import.meta.env.VITE_API_URL;
if (!import.meta.env.VITE_API_URL) {
    console.error("[\x1b[31mCONFIG ERROR\x1b[0m] VITE_API_URL environment variable is missing!");
}

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return
    const fetchNotifs = async () => {
      try {
        const endpoint = user.role === 'superadmin'
          ? `${API_BASE}/superadmin/notifications`
          : `${API_BASE}/moderators/notifications`
        const res = await fetch(endpoint)
        const result = await res.json()
        if (result.success) setNotifications(result.data)
      } catch (err) { console.error(err) }
      finally { setNotifLoading(false) }
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 10000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    if (!user) setIsMobileMenuOpen(false)
  }, [user])

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

  const navLinks = []

  if (user?.role === 'admin') {
    navLinks.push({ name: t({ fr: 'Dashboard', en: 'Dashboard' }), path: ROUTES.ADMIN.DASHBOARD, icon: ShieldCheckIcon })
    navLinks.push({ name: t({ fr: 'Rapport', en: 'Report' }), path: ROUTES.ADMIN.STATISTICS, icon: ChartBarIcon })
  } else if (user?.role === 'superadmin') {
    navLinks.push({ name: t({ fr: 'SuperAdmin', en: 'SuperAdmin' }), path: '/superadmin', icon: ShieldCheckIcon })
  } else {
    navLinks.push({ name: t({ fr: 'Accueil', en: 'Home' }), path: ROUTES.HOME, icon: HomeIcon })
    navLinks.push({ name: t({ fr: 'Résultats', en: 'Results' }), path: ROUTES.RESULTS, icon: ChartBarIcon })
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
      ? 'bg-white/80 backdrop-blur-xl border-b border-slate-100 py-3 shadow-sm'
      : 'bg-transparent py-5'
      }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center space-x-3 group outline-none">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full blur opacity-5 group-hover:opacity-10 transition duration-500"></div>
              <img src={epitechLogo} alt="Epitech Logo" className="relative h-10 w-auto object-contain transition-transform group-hover:scale-110 z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">EpiVote</span>
              <span className="text-[10px] font-bold text-primary-600 tracking-[0.2em] uppercase">Built with Epitech</span>
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
                    ? 'text-primary-600'
                    : 'text-slate-500 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary-500' : ''}`} />
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                  )}
                </Link>
              )
            })}

            {/* Notification Bell (Admin + SuperAdmin) */}
            {user && (user.role === 'admin' || user.role === 'superadmin') && location.pathname !== '/' && (
              <button
                onClick={() => setIsNotifModalOpen(true)}
                className="p-2 text-slate-400 hover:text-primary-600 transition-colors relative group"
              >
                <BellIcon className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>
            )}

            <div className="h-6 w-px bg-slate-100 mx-3"></div>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 bg-slate-50 border border-slate-100 pl-2 pr-4 py-1.5 rounded-full hover:bg-slate-100 transition-colors">
                  <div className="h-7 w-7 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      user.email.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-600 max-w-[120px] truncate">{user.email}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Déconnexion"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <Link to={ROUTES.VOTER} className="btn-primary transform scale-90 flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4" />
                Voter
              </Link>
            )}
          </div>

          {/* Mobile: inline notification bell + avatar + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {/* Notification bell for admin + superadmin */}
            {user && (user.role === 'admin' || user.role === 'superadmin') && location.pathname !== '/' && (
              <button
                onClick={() => setIsNotifModalOpen(true)}
                className="relative p-2 text-slate-500 hover:text-primary-600 transition-colors"
              >
                <BellIcon className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>
            )}
            {/* Avatar (profile link) */}
            {user && (
              <a
                href="/profile"
                className="h-8 w-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm overflow-hidden shrink-0"
              >
                {user.avatar
                  ? <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                  : user.email.substring(0, 2).toUpperCase()
                }
              </a>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-500 hover:text-primary-600 transition-colors"
            >
              {isMobileMenuOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 overflow-hidden transition-all duration-500 ${isMobileMenuOpen ? 'max-h-[500px] border-b border-slate-100 bg-white shadow-lg' : 'max-h-0'
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
                className={`flex items-center space-x-4 p-4 rounded-2xl transition-all ${isActive ? 'bg-primary-50 text-primary-700 border border-primary-100' : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? 'text-primary-500' : ''}`} />
                <span className="text-lg font-bold">{link.name}</span>
              </Link>
            )
          })}

          <div className="pt-4 border-t border-slate-100">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4">
                  <UserCircleIcon className="h-8 w-8 text-primary-500" />
                  <span className="text-slate-800 font-medium">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 p-4 bg-red-50 text-red-600 rounded-2xl font-bold border border-red-100"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            ) : (
              <Link
                to={ROUTES.VOTER}
                className="btn-primary w-full text-center block py-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Voter
              </Link>
            )}
          </div>
        </div>
      </div>
      <Modal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        title={t({ fr: 'Notifications Activité', en: 'Activity Notifications' })}
        size="md"
      >
        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <BellIcon className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-sm text-slate-400 font-medium italic">Aucune activité récente.</p>
            </div>
          ) : (
            notifications.map((n, i) => (
              <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${n.decision === 'validate' ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-rose-500 shadow-lg shadow-rose-200'}`}></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-900 truncate mb-0.5">{n.email}</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {n.decision === 'validate' ? 'A validé une session' : 'A invalidé une session'}
                    </p>
                    {n.reason && (
                      <div className="mt-2 text-[11px] bg-white border border-rose-100 text-rose-600 p-2.5 rounded-xl italic font-medium">
                        "{n.reason}"
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 mt-2 font-mono uppercase tracking-wider">
                      {new Date(n.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </nav >
  )
}

export default Navbar