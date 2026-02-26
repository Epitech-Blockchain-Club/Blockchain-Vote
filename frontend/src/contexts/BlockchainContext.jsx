import React, { createContext, useState, useContext } from 'react'
import toast from 'react-hot-toast'

const BlockchainContext = createContext()

export function BlockchainProvider({ children }) {
  const [connected, setConnected] = useState(false)
  const [account, setAccount] = useState(null)
  const [network, setNetwork] = useState(null)

  const connect = async () => {
    try {
      // Simulation de connexion blockchain
      setConnected(true)
      setAccount('0x' + Math.random().toString(16).substring(2, 42))
      setNetwork('Polygon Mumbai')
      toast.success('Connecté à la blockchain')
      return true
    } catch (error) {
      toast.error('Erreur de connexion')
      return false
    }
  }

  const sendTransaction = async (to, data) => {
    try {
      // Simulation d'envoi de transaction
      const txHash = '0x' + Math.random().toString(16).substring(2, 66)
      toast.success('Transaction envoyée')
      return { hash: txHash, status: 'success' }
    } catch (error) {
      toast.error('Erreur de transaction')
      throw error
    }
  }

  const verifyTransaction = (hash) => {
    // Simulation de vérification
    return {
      hash,
      status: 'confirmed',
      blockNumber: Math.floor(Math.random() * 1000000),
      timestamp: Date.now()
    }
  }

  return (
    <BlockchainContext.Provider value={{
      connected,
      account,
      network,
      connect,
      sendTransaction,
      verifyTransaction
    }}>
      {children}
    </BlockchainContext.Provider>
  )
}

export function useBlockchain() {
  return useContext(BlockchainContext)
}