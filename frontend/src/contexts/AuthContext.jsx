import React, { createContext, useState, useContext, useEffect } from 'react'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      // Simuler une API call
      if (email && password) {
        const userData = { email, role: email.includes('admin') ? 'admin' : 'voter' }
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        toast.success('Connexion réussie')
        return userData
      }
      throw new Error('Email ou mot de passe incorrect')
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    toast.success('Déconnexion réussie')
  }

  const verifyEmail = (email) => {
    // Simuler la vérification d'email
    return true
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, verifyEmail }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}