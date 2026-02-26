import React from 'react'

export default function Sidebar() {
  return (
    <aside className="w-64 p-4 bg-gray-900 text-white hidden md:block">
      <nav className="flex flex-col gap-2">
        <a href="/" className="hover:underline">Accueil</a>
        <a href="/admin" className="hover:underline">Admin</a>
        <a href="/about" className="hover:underline">À propos</a>
      </nav>
    </aside>
  )
}
