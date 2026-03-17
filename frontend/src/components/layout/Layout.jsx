import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pb-12 pt-24">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout