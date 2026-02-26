import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ElectionProvider } from './contexts/ElectionContext'
import { BlockchainProvider } from './contexts/BlockchainContext'
import Layout from './components/layout/Layout'

// Pages
import HomePage from './Pages/HomePage'
import VoterPage from './Pages/VoterPage'
import ElectionPage from './Pages/ElectionPage'
import ResultsPage from './Pages/ResultsPage'
import AdminPage from './Pages/AdminPage'
import LoginPage from './Pages/LoginPage'
import AboutPage from './Pages/AboutPage'
import VerificationPage from './Pages/VerificationPage'

function App() {
  return (
    <Router>
      <AuthProvider>
        <ElectionProvider>
          <BlockchainProvider>
            <Layout>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1f2937',
                    color: '#fff',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/voter" element={<VoterPage />} />
                <Route path="/election/:id" element={<ElectionPage />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/results/:id" element={<ResultsPage />} />
                <Route path="/admin/*" element={<AdminPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/verify/:txHash" element={<VerificationPage />} />
                <Route path="/verify" element={<VerificationPage />} />
              </Routes>
            </Layout>
          </BlockchainProvider>
        </ElectionProvider>
      </AuthProvider>
    </Router>
  )
}

export default App