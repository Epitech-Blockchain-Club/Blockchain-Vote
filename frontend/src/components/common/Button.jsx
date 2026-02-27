import React from 'react'
import { motion } from 'framer-motion'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = 'font-bold rounded-xl transition-all duration-300 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 shadow-lg outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 overflow-hidden relative group'

  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'bg-transparent border-2 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-800/20 px-6 py-2.5',
    danger: 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white shadow-red-500/20 px-6 py-2.5'
  }

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-4 text-base tracking-wide'
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${loading ? 'opacity-75 cursor-wait' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement...
        </>
      ) : children}
    </motion.button>
  )
}

export default Button