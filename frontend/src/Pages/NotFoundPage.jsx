import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const NotFoundPage = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center mb-8 border border-slate-200">
        <span className="text-4xl font-black text-slate-300">404</span>
      </div>
      <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Page introuvable</h1>
      <p className="text-slate-500 font-medium max-w-sm mb-10 leading-relaxed">
        Cette page n'existe pas ou a été déplacée. Vérifiez l'URL ou retournez à l'accueil.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/">
          <button className="h-12 px-8 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">
            Retour à l'accueil
          </button>
        </Link>
        {isAdmin && (
          <Link to="/admin">
            <button className="h-12 px-8 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
              Dashboard admin
            </button>
          </Link>
        )}
      </div>
    </div>
  )
}

export default NotFoundPage
