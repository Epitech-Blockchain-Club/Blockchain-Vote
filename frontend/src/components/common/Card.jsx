import React from 'react'
import { motion } from 'framer-motion'

const Card = ({ children, className = '', onClick, hoverable = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-gray-800 rounded-lg shadow-lg p-6 ${hoverable ? 'hover:shadow-xl transition-shadow cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

export default Card