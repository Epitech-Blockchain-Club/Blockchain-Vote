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
      await login(email, password)
      navigate('/')
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full mx-auto px-4">
      <div className="text-center mb-8">
        <div className="inline-block p-4 bg-slate-800/50 rounded-3xl mb-4 border border-slate-700/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-indigo-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          <img src={epitechLogo} alt="Epitech Logo" className="h-16 w-auto relative z-10" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter">AUTHENTIFICATION</h1>
        <p className="text-slate-400 font-medium">Accédez à votre espace de vote sécurisé</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-10 ring-1 ring-white/5">
        <h2 className="text-xl font-bold text-white mb-8 border-b border-slate-800 pb-4 flex items-center">
          <ShieldCheckIcon className="h-5 w-5 mr-2 text-indigo-400" />
          Connexion Blockchain
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Email Professionnel
            </label>
            <div className="relative group">
              <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-12"
                placeholder="nom@epitech.eu"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Clef Secrète
            </label>
            <div className="relative group">
              <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-12"
                placeholder="••••••••••••"
                required
              />
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800/50 space-y-2">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">Comptes de test</p>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Admin:</span>
              <span className="text-slate-300 font-mono">admin@epitech.com</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Votant:</span>
              <span className="text-slate-300 font-mono">voter@epitech.com</span>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full py-4 text-base font-black shadow-indigo-500/10 shadow-xl"
          >
            S'IDENTIFIER SUR LE SC
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