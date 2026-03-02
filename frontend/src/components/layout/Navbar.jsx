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
  BellIcon,
  LanguageIcon
} from '@heroicons/react/24/outline'
import { ROUTES } from '../../constants/routes'
import epitechLogo from '../../assets/epitech-logo.png'
import clubLogo from '../../assets/club-logo.jpg'
import { useSettings } from '../../contexts/SettingsContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { language, toggleLanguage, t } = useSettings()
  const navigate = useNavigate()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notifications] = useState([
    { id: 1, text: 'Le modérateur Marie D. a validé le scrutin Alumni.', time: 'il y a 2 min', unread: true },
    { id: 2, text: 'La session "Chapter France" est désormais close.', time: 'il y a 1h', unread: false },
    { id: 3, text: 'Nouvelle proposition de vote soumise au consensus.', time: 'il y a 3h', unread: true }
  ])

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
  } else {
    navLinks.push({ name: t({ fr: 'Accueil', en: 'Home' }), path: ROUTES.HOME, icon: HomeIcon })
    navLinks.push({ name: t({ fr: 'Voter', en: 'Vote' }), path: ROUTES.VOTER, icon: UserGroupIcon })
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
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <img src={epitechLogo} alt="Epitech Logo" className="relative h-10 w-auto object-contain transition-transform group-hover:scale-110 z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">VoteChain</span>
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

            <div className="h-6 w-px bg-slate-100 mx-3"></div>


            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-2 py-1 text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors uppercase flex items-center gap-1"
              title="Changer la langue"
            >
              <LanguageIcon className="h-5 w-5" />
              <span>{language === 'fr' ? 'EN' : 'FR'}</span>
            </button>

            <div className="h-6 w-px bg-slate-100 mx-3"></div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-slate-400 hover:text-primary-600 transition-colors relative"
              >
                <BellIcon className="h-6 w-6" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute top-full right-0 mt-4 w-80 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden animate-fade-in py-2">
                  <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Notifications</span>
                    <span className="text-[10px] text-primary-600 font-bold bg-primary-50 px-2 py-0.5 rounded-full">3 nouvelles</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`px-4 py-4 hover:bg-slate-50 border-b border-slate-50 transition-colors cursor-pointer ${n.unread ? 'bg-primary-50/20' : ''}`}>
                        <p className="text-xs font-semibold text-slate-800 leading-tight mb-1">{n.text}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{n.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
              <Link to={ROUTES.LOGIN} className="btn-primary transform scale-90">
                Connexion
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
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