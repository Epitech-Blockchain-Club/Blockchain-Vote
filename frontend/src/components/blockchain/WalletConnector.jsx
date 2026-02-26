import React from 'react'
import { useBlockchain } from '../../contexts/BlockchainContext'
import Button from '../common/Button'
import { WalletIcon } from '@heroicons/react/24/outline'

const WalletConnector = () => {
  const { connected, account, network, connect } = useBlockchain()

  if (connected) {
    return (
      <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-300">Connecté</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">{network}</p>
          <p className="text-xs text-primary-400">
            {account?.substring(0, 6)}...{account?.substring(38)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Button onClick={connect} variant="outline" size="sm">
      <WalletIcon className="h-4 w-4 mr-2" />
      Connecter wallet
    </Button>
  )
}

export default WalletConnector