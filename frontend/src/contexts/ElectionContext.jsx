import React, { createContext, useState, useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from './AuthContext'

const ElectionContext = createContext()

// Données réelles chargées via l'API

export function ElectionProvider({ children }) {
  const { user } = useAuth()
  const [elections, setElections] = useState([])
  const [users, setUsers] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchElections = async () => {
    console.log('🏁 [CONTEXT] fetchElections triggered');
    try {
      setLoading(true)
      const res = await fetch('http://localhost:3001/api/scrutins')
      const result = await res.json()
      if (result.success) {
        // Map backend scrutin to frontend election model
        const mapped = result.data.map(scrutin => {
          const sessions = scrutin.sessions || []
          const allValidated = sessions.length > 0 && sessions.every(s => s.isValidated)

          return {
            id: scrutin.address,
            title: scrutin.title || 'Sans titre',
            description: scrutin.description || '',
            type: scrutin.scope || 'local',
            country: scrutin.country,
            startDate: scrutin.startDate || scrutin.createdAt || new Date().toISOString(),
            endDate: scrutin.endDate || new Date(new Date(scrutin.createdAt || Date.now()).getTime() + 86400000 * 7).toISOString(),
            sessions: sessions,
            votes: scrutin.votes || {},
            votedCount: scrutin.votedCount || 0,
            timeSeries: scrutin.timeSeries || [],
            voters: scrutin.voters || [], // Global voters
            voterCount: scrutin.voters?.length || sessions.reduce((acc, s) => acc + (s.voterCount || 0), 0),
            status: allValidated ? 'active' : 'pending_validation',
            // A scrutin is only invalidated when ALL its sessions are invalidated
            isInvalidated: sessions.length > 0 && sessions.every(s => s.isInvalidated)
          }
        })
        setElections(mapped)
        console.log('[CONTEXT] Stats Check:', mapped.map(e => ({ id: e.id, votes: e.votes, ts: e.timeSeries })));
        console.log('[CONTEXT] Elections fetched and mapped:', mapped.length);
      }
    } catch (error) {
      console.error('Fetch elections error:', error)
      toast.error('Erreur lors du chargement des élections')
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/auth/users')
      const result = await res.json()
      if (result.success) setUsers(result.data)
    } catch (err) { console.error(err) }
  }

  const fetchOrganizations = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/auth/organizations')
      const result = await res.json()
      if (result.success) setOrganizations(result.data)
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      // Add a max-timeout so loading never spinns indefinitely
      const timeout = setTimeout(() => setLoading(false), 8000)
      try {
        await Promise.all([fetchElections(), fetchUsers(), fetchOrganizations()])
      } catch (err) {
        console.error('Init error:', err)
      } finally {
        clearTimeout(timeout)
        setLoading(false)
      }
    }
    init()

    // Auto-refresh every 45 seconds to pick up blockchain state changes
    const interval = setInterval(() => fetchElections(), 45000)
    return () => clearInterval(interval)
  }, [])

  const getResults = async (address) => {
    try {
      const res = await fetch(`http://localhost:3001/api/scrutins/${address}/results`)
      const result = await res.json()
      if (result.success) return result.data
      throw new Error(result.error)
    } catch (error) {
      console.error('Fetch results error:', error)
      return null
    }
  }

  const castVote = async ({ electionId, candidateId, email, country }) => {
    try {
      const res = await fetch('http://localhost:3001/api/votes/cast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: electionId, // In this simplified model, electionId is the session address
          voterEmail: email,
          optionIndex: candidateId // ID is the index in our contract
        })
      })
      const result = await res.json()
      if (result.success) {
        toast.success('Vote enregistré sur la blockchain !')
        fetchElections() // Refresh data
        return true
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error('Erreur: ' + (error.message || 'Vote impossible'))
      return false
    }
  }

  const addElection = async (newElection) => {
    try {
      const res = await fetch('http://localhost:3001/api/scrutins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newElection.title,
          description: newElection.description,
          scope: newElection.scope,
          country: newElection.country,
          org: user?.org || 'epitech', // Associate with user's organization
          timingMode: newElection.timingMode,
          startDate: newElection.startDate,
          endDate: newElection.endDate,
          voters: newElection.voters, // Root level voters
          voteSessions: newElection.voteSessions.map(s => ({
            title: s.title,
            description: s.description,
            moderators: (s.moderators || []).filter(m => m.trim() !== ''),
            voterCount: parseInt(s.voterCount) || 0,
            voters: s.voters || [], // Session level voters
            options: s.parts.map(p => ({
              title: p.title,
              description: p.description,
              imageUrl: p.imageUrl,
              members: p.members
            }))
          }))
        })
      })
      const result = await res.json()
      if (result.success) {
        toast.success('Election créée sur la blockchain !')
        await fetchElections()
        return result
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error('Erreur de création: ' + error.message)
      return null
    }
  }

  const updateElection = (id, updates) => {
    toast.error('Mise à jour non supportée sur la blockchain pour le moment')
  }

  const deleteElection = (id) => {
    toast.error('Suppression non supportée sur la blockchain')
  }

  const getElectionById = async (id) => {
    if (!id) return null;
    // Find in memory
    return elections.find(e => e.id?.toLowerCase() === id.toLowerCase()) || null;
  }

  const addUser = async (userData) => {
    try {
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      const result = await res.json()
      if (result.success) {
        toast.success('Administrateur créé !')
        fetchUsers()
        return true
      }
      throw new Error(result.error)
    } catch (err) {
      toast.error(err.message)
      return false
    }
  }

  const assignAdminToOrg = async (orgId, adminEmail) => {
    try {
      const res = await fetch('http://localhost:3001/api/auth/organizations/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, adminEmail })
      })
      const result = await res.json()
      if (result.success) {
        toast.success('Admin assigné avec succès !')
        fetchOrganizations()
        return true
      }
    } catch (err) { toast.error('Erreur assignation') }
    return false
  }

  const createOrganization = async (orgData) => {
    try {
      // Assuming API_URL is defined elsewhere or using direct URL
      const res = await fetch('http://localhost:3001/api/auth/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgData)
      })
      const result = await res.json()
      if (result.success) {
        fetchOrganizations()
        toast.success('Organisation créée !')
        return true
      }
      throw new Error(result.error)
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la création')
      return false
    }
  }

  return (
    <ElectionContext.Provider value={{
      elections,
      users,
      organizations,
      loading,
      castVote,
      addElection,
      updateElection,
      deleteElection,
      addUser,
      assignAdminToOrg,
      createOrganization,
      getResults,
      getElectionById,
      refreshElections: fetchElections
    }}>
      {children}
    </ElectionContext.Provider>
  )
}

export function useElections() {
  return useContext(ElectionContext)
}