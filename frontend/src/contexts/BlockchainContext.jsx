import React, { createContext, useState, useContext } from 'react'
import toast from 'react-hot-toast'
import { API_ROUTES } from '../config/api'

const BlockchainContext = createContext()

export function BlockchainProvider({ children }) {
  const [connected, setConnected] = useState(false)
  const [account, setAccount] = useState(null)
  const [network, setNetwork] = useState(null)

  const connect = async () => {
    try {
      // Connect to the backend API instead of simulation
      const response = await fetch(`${API_ROUTES.SCRUTINS}`);
      if (!response.ok) throw new Error('Backend unreachable');

      setConnected(true)
      // Real wallet address would come from MetaMask here, but for these portals 
      // we use a relayer-signed model. We'll set a placeholder account.
      setAccount('0x' + Math.random().toString(16).substring(2, 42))
      setNetwork('Hardhat Localhost')
      toast.success('Connecté au backend blockchain')
      return true
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Erreur de connexion au backend')
      setConnected(false)
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