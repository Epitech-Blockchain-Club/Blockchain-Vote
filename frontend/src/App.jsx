import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ElectionProvider } from './contexts/ElectionContext'
import { BlockchainProvider } from './contexts/BlockchainContext'
import { SettingsProvider } from './contexts/SettingsContext'
import Layout from './components/layout/Layout'

// Pages
import HomePage from './Pages/HomePage'
import VoterPage from './Pages/VoterPage'
import ElectionPage from './Pages/ElectionPage'
import ResultsPage from './Pages/ResultsPage'
import AdminPage from './Pages/AdminPage'
import LoginPage from './Pages/LoginPage'
import VerificationPage from './Pages/VerificationPage'
import ProfilePage from './Pages/ProfilePage'
import RequestVotePage from './Pages/RequestVotePage'
import SuperAdminPage from './Pages/SuperAdminPage'
import VoterPortalPage from './Pages/VoterPortalPage'
import ModeratorPortalPage from './Pages/ModeratorPortalPage'
import OAuthCallbackPage from './Pages/OAuthCallbackPage'

function App() {
  return (
    <Router>
      <SettingsProvider>
        <AuthProvider>
          <ElectionProvider>
            <BlockchainProvider>
              <Layout>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#ffffff',
                      color: '#0f172a',
                      borderRadius: '16px',
                      border: '1px solid #f1f5f9',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    },
                    success: {
                      iconTheme: {
                        primary: '#2563eb',
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
                  <Route path="/superadmin/*" element={<SuperAdminPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/verify/:txHash" element={<VerificationPage />} />
                  <Route path="/verify" element={<VerificationPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/request-vote" element={<RequestVotePage />} />
                  {/* Public portals — no login required */}
                  <Route path="/vote/:id" element={<VoterPortalPage />} />
                  <Route path="/moderate/:id" element={<ModeratorPortalPage />} />
                  <Route path="/moderate/:id/:sessionId" element={<ModeratorPortalPage />} />
                  <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
                </Routes>
              </Layout>
            </BlockchainProvider>
          </ElectionProvider>
        </AuthProvider>
      </SettingsProvider>
    </Router>
  )
}

export default App