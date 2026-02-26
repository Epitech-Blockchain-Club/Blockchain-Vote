import React from 'react'
import epitechLogo from '../assets/epitech-logo.png'
import clubLogo from '../assets/club-logo.jpg'

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 py-6 shadow-md">
      <div className="container flex flex-col md:flex-row items-center justify-center gap-4">
        <img src={clubLogo} alt="Epitech Blockchain Club" className="h-16" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Plateforme de Vote BVote
        </h1>
        <img src={epitechLogo} alt="Epitech" className="h-16" />
      </div>
    </header>
  )
}