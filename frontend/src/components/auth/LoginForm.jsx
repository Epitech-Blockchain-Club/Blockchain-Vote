import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../common/Button'
import { EnvelopeIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import epitechLogo from '../../assets/epitech-logo.png'

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(email, password)
      if (user.role === 'superadmin') {
        navigate('/superadmin')
      } else if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full mx-auto px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-5 bg-white rounded-3xl mb-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary-50 -translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          <img src={epitechLogo} alt="Epitech Logo" className="h-16 w-auto relative z-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">IDENTIFICATION</h1>
        <p className="text-slate-500 font-medium">Portail de gouvernance décentralisée</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
        <h2 className="text-base font-black text-slate-900 mb-8 flex items-center uppercase tracking-widest">
          <ShieldCheckIcon className="h-5 w-5 mr-3 text-primary-600" />
          Certifié Blockchain
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
              Courriel de l'organisation
            </label>
            <div className="relative group">
              <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary-600 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 pl-12 pr-6 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all font-medium"
                placeholder="votre-nom@epitech.eu"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
              Token de sécurité
            </label>
            <div className="relative group">
              <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary-600 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 pl-12 pr-6 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all font-mono"
                placeholder="••••••••••••"
                required
              />
            </div>
          </div>

          {window.location.pathname === '/login' && (
            <div className="bg-primary-50/50 rounded-2xl p-5 border border-primary-100/50 space-y-3">
              <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-1">Identifiants de test (Développement)</p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-tighter">Administrateur:</span>
                <span className="text-slate-900 font-black">admin@votechain.com</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-tighter">Super admin:</span>
                <span className="text-slate-900 font-black">super@votechain.com</span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            loading={loading}
            className="w-full h-16 text-sm font-black shadow-primary-500/20 shadow-xl tracking-widest uppercase"
          >
            Se connecter au Scrutin
          </Button>

          <p className="text-center text-xs text-slate-500 font-medium">
            En vous connectant, vous interagissez directement avec le protocole de gouvernance.
          </p>
        </div>
      </form>
    </div>
  )
}

export default LoginForm