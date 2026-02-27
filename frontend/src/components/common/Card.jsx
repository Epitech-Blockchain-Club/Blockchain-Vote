import React from 'react'
import { motion } from 'framer-motion'

const Card = ({ children, className = '', onClick, hoverable = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`card ${hoverable ? 'hover:-translate-y-1 hover:shadow-indigo-500/10 cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

export default Card