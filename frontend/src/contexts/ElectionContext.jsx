import React, { createContext, useState, useContext, useEffect } from 'react'
import toast from 'react-hot-toast'

const ElectionContext = createContext()

// Données mockées
const MOCK_ELECTIONS = [
  {
    id: '1',
    title: 'Élection du Bureau des Alumni',
    description: 'Élection du nouveau bureau des alumni Epitech Afrique',
    type: 'international',
    startDate: new Date(Date.now() - 86400000).toISOString(), // hier
    endDate: new Date(Date.now() + 86400000 * 3).toISOString(), // dans 3 jours
    candidates: [
      { id: 'c1', name: 'Marie Dupont', bio: 'Promo 2020, Experte en blockchain', photo: null },
      { id: 'c2', name: 'Jean Konan', bio: 'Promo 2019, Entrepreneur', photo: null },
      { id: 'c3', name: 'Aminata Diallo', bio: 'Promo 2021, Community Manager', photo: null }
    ],
    votes: { c1: 45, c2: 32, c3: 28 },
    voters: [],
    status: 'active',
    countries: ['FR', 'BJ', 'SN', 'CI']
  },
  {
    id: '2',
    title: 'Lead Chapter France',
    description: 'Élection du responsable pour le chapitre France',
    type: 'local',
    country: 'FR',
    startDate: new Date(Date.now() - 86400000).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    candidates: [
      { id: 'c4', name: 'Pierre Martin', bio: 'Lead Dev chez TechCorp', photo: null },
      { id: 'c5', name: 'Sophie Bernard', bio: 'Product Manager', photo: null }
    ],
    votes: { c4: 23, c5: 19 },
    voters: [],
    status: 'active'
  }
]

export function ElectionProvider({ children }) {
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Charger les élections depuis localStorage ou utiliser les mock
    const stored = localStorage.getItem('elections')
    if (stored) {
      setElections(JSON.parse(stored))
    } else {
      setElections(MOCK_ELECTIONS)
      localStorage.setItem('elections', JSON.stringify(MOCK_ELECTIONS))
    }
    setLoading(false)
  }, [])

  const castVote = ({ electionId, candidateId, email, country }) => {
    setElections(prev => {
      const updated = prev.map(election => {
        if (election.id !== electionId) return election
        
        // Vérifier si l'utilisateur a déjà voté
        if (election.voters.includes(email)) {
          toast.error('Vous avez déjà voté pour cette élection')
          return election
        }

        // Vérifier le pays pour les élections locales
        if (election.type === 'local' && election.country !== country) {
          toast.error('Vous ne pouvez pas voter pour cette élection locale')
          return election
        }

        toast.success('Vote enregistré avec succès')
        
        return {
          ...election,
          votes: {
            ...election.votes,
            [candidateId]: (election.votes[candidateId] || 0) + 1
          },
          voters: [...election.voters, email]
        }
      })
      
      localStorage.setItem('elections', JSON.stringify(updated))
      return updated
    })
  }

  const addElection = (newElection) => {
    const electionWithId = {
      ...newElection,
      id: Date.now().toString(),
      votes: {},
      voters: []
    }
    
    setElections(prev => {
      const updated = [...prev, electionWithId]
      localStorage.setItem('elections', JSON.stringify(updated))
      toast.success('Élection créée avec succès')
      return updated
    })
    
    return electionWithId
  }

  const updateElection = (id, updates) => {
    setElections(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, ...updates } : e)
      localStorage.setItem('elections', JSON.stringify(updated))
      toast.success('Élection mise à jour')
      return updated
    })
  }

  const deleteElection = (id) => {
    setElections(prev => {
      const updated = prev.filter(e => e.id !== id)
      localStorage.setItem('elections', JSON.stringify(updated))
      toast.success('Élection supprimée')
      return updated
    })
  }

  return (
    <ElectionContext.Provider value={{
      elections,
      loading,
      castVote,
      addElection,
      updateElection,
      deleteElection
    }}>
      {children}
    </ElectionContext.Provider>
  )
}

export function useElections() {
  return useContext(ElectionContext)
}