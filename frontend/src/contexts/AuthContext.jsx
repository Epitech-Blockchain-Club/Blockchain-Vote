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
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const result = await res.json()

      if (result.success) {
        const userData = result.user
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        toast.success(`Bienvenue, ${userData.role}`)
        return userData
      } else {
        throw new Error(result.error || 'Email ou mot de passe incorrect')
      }
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

  const verifyEmail = async (email) => {
    // Check if email belongs to an allowed voter (placeholder for now)
    return true
  }

  const updateUser = (newData) => {
    const updatedUser = { ...user, ...newData }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, verifyEmail, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}