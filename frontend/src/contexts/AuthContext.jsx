import React, { createContext, useState, useContext, useEffect } from 'react'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const API_BASE = import.meta.env.VITE_API_URL;
if (!import.meta.env.VITE_API_URL) {
    console.error("[\x1b[31mCONFIG ERROR\x1b[0m] VITE_API_URL environment variable is missing!");
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authToken, setAuthToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Voter authentication state
  const [voterAuth, setVoterAuth] = useState({
    isAuthenticated: false,
    email: null,
    provider: null,
    scrutinId: null,
    authorizedSessions: [],
    hasVoted: false,
    oauthToken: null
  })

  const [oauthConfig, setOAuthConfig] = useState({
    googleClientId: '',
    microsoftClientId: '',
    microsoftTenantId: 'common'
  })

  const fetchOAuthConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/oauth-config`)
      const result = await res.json()
      if (result.success) {
        setOAuthConfig({
          googleClientId: result.googleClientId,
          microsoftClientId: result.microsoftClientId,
          microsoftTenantId: result.microsoftTenantId || 'common'
        })
      }
    } catch (error) {
      console.error('Failed to fetch OAuth config:', error)
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('authToken')
    const storedVoterAuth = localStorage.getItem('voterAuth')

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    if (storedToken) {
      setAuthToken(storedToken)
    }

    if (storedVoterAuth) {
      setVoterAuth(JSON.parse(storedVoterAuth))
    }

    fetchOAuthConfig()
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const result = await res.json()

      if (result.success) {
        const userData = result.user
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        if (result.token) {
          setAuthToken(result.token)
          localStorage.setItem('authToken', result.token)
        }
        toast.success(`Bienvenue, ${userData.role}`)
        return userData
      } else {
        throw new Error(result.error || 'Email ou mot de passe incorrect')
      }
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  const loginWithGoogle = async (scrutinId = null) => {
    return new Promise((resolve) => {
      const clientId = oauthConfig.googleClientId;
      if (!clientId) {
        toast.error("Google Client ID non configuré");
        return resolve(null);
      }

      const redirectUri = window.location.origin + '/oauth-callback';
      const scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
      const state = `google${scrutinId ? `|${scrutinId}` : ''}`;

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;

      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(authUrl, 'Google Login', `width=${width},height=${height},left=${left},top=${top}`);

      const messageHandler = async (event) => {
        if (event.data.type === 'oauth-voter-success' || event.data.type === 'oauth-success') {
          const authData = event.data;

          // Role discovery via backend
          let userData = {
            email: authData.userProfile.email,
            name: authData.userProfile.name,
            provider: 'google',
            ...authData.userProfile
          };

          try {
            const res = await fetch(`${API_BASE}/auth/oauth-login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userData.email, name: userData.name, provider: 'google' })
            });
            const result = await res.json();
            if (result.success) {
              userData = { ...userData, ...result.user };
            } else {
              userData.role = 'voter'; // Fallback for pure voters
            }
          } catch (e) {
            console.warn("Role discovery failed, falling back to voter role");
            userData.role = 'voter';
          }

          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));

          if (authData.type === 'oauth-voter-success') {
            authenticateVoter({
              userProfile: authData.userProfile,
              token: authData.token,
              scrutinId: authData.scrutinId,
              sessions: authData.sessions,
              hasVoted: authData.hasVoted,
              provider: 'google'
            });
          }

          window.removeEventListener('message', messageHandler);
          toast.success("Authentifié via Google");
          resolve(userData);
        } else if (event.data.type === 'oauth-error' || event.data.type === 'oauth-voter-unauthorized') {
          toast.error(event.data.error || "Erreur d'authentification");
          window.removeEventListener('message', messageHandler);
          resolve(null);
        }
      };

      window.addEventListener('message', messageHandler);
    });
  }

  const loginWithOffice365 = async (scrutinId = null) => {
    return new Promise((resolve) => {
      const clientId = oauthConfig.microsoftClientId;
      if (!clientId) {
        toast.error("Microsoft Client ID non configuré");
        return resolve(null);
      }

      const redirectUri = window.location.origin + '/oauth-callback';
      const scope = 'openid profile email User.Read';
      const state = `microsoft${scrutinId ? `|${scrutinId}` : ''}`;
      const tenantId = oauthConfig.microsoftTenantId || 'common';

      const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;

      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(authUrl, 'Microsoft Login', `width=${width},height=${height},left=${left},top=${top}`);

      const messageHandler = async (event) => {
        if (event.data.type === 'oauth-voter-success' || event.data.type === 'oauth-success') {
          const authData = event.data;

          // Role discovery via backend
          let userData = {
            email: authData.userProfile.email,
            name: authData.userProfile.name,
            provider: 'microsoft',
            ...authData.userProfile
          };

          try {
            const res = await fetch(`${API_BASE}/auth/oauth-login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userData.email, name: userData.name, provider: 'microsoft' })
            });
            const result = await res.json();
            if (result.success) {
              userData = { ...userData, ...result.user };
            } else {
              userData.role = 'voter';
            }
          } catch (e) {
            console.warn("Role discovery failed, falling back to voter role");
            userData.role = 'voter';
          }

          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));

          if (authData.type === 'oauth-voter-success') {
            authenticateVoter({
              userProfile: authData.userProfile,
              token: authData.token,
              scrutinId: authData.scrutinId,
              sessions: authData.sessions,
              hasVoted: authData.hasVoted,
              provider: 'microsoft'
            });
          }

          window.removeEventListener('message', messageHandler);
          toast.success("Authentifié via Office 365");
          resolve(userData);
        } else if (event.data.type === 'oauth-error' || event.data.type === 'oauth-voter-unauthorized') {
          toast.error(event.data.error || "Erreur d'authentification");
          window.removeEventListener('message', messageHandler);
          resolve(null);
        }
      };

      window.addEventListener('message', messageHandler);
    });
  }

  const loginWithToken = async (token) => {
    try {
      const res = await fetch(`${API_BASE}/auth/moderator/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      const result = await res.json()

      if (result.success) {
        const userData = result.user
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        toast.success(`Identification réussie : ${userData.email}`)
        return userData
      } else {
        throw new Error(result.error || 'Token invalide ou expiré')
      }
    } catch (error) {
      console.error('Token login error:', error)
      throw error
    }
  }

  // Voter authentication methods
  const authenticateVoter = async (oauthData) => {
    try {
      const { userProfile, token, scrutinId, sessions, hasVoted } = oauthData

      const newVoterAuth = {
        isAuthenticated: true,
        email: userProfile.email,
        provider: oauthData.provider || 'google',
        scrutinId: scrutinId || null,
        authorizedSessions: sessions || [],
        hasVoted: hasVoted || false,
        oauthToken: token,
        name: userProfile.name,
        verifiedEmail: userProfile.verified_email || true
      }

      setVoterAuth(newVoterAuth)
      localStorage.setItem('voterAuth', JSON.stringify(newVoterAuth))

      return newVoterAuth
    } catch (error) {
      console.error('Voter authentication error:', error)
      throw error
    }
  }

  const verifyVoterForScrutin = async (email, scrutinId) => {
    try {
      const res = await fetch(`${API_BASE}/auth/verify-voter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, scrutinId })
      })
      const result = await res.json()

      if (result.success && result.authorized) {
        // Update voter auth with scrutin-specific data
        const updatedVoterAuth = {
          ...voterAuth,
          scrutinId,
          authorizedSessions: result.sessions || [],
          hasVoted: result.hasVoted || false
        }

        setVoterAuth(updatedVoterAuth)
        localStorage.setItem('voterAuth', JSON.stringify(updatedVoterAuth))

        return {
          authorized: true,
          sessions: result.sessions,
          hasVoted: result.hasVoted
        }
      } else {
        return {
          authorized: false,
          error: result.error || 'Voter not authorized'
        }
      }
    } catch (error) {
      console.error('Voter verification error:', error)
      throw error
    }
  }

  const getAvailableScrutins = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/scrutins/available?email=${encodeURIComponent(email)}`)
      const result = await res.json()

      if (result.success) {
        return result.scrutins || []
      } else {
        throw new Error(result.error || 'Failed to fetch available scrutins')
      }
    } catch (error) {
      console.error('Error fetching available scrutins:', error)
      throw error
    }
  }

  const updateVoterSession = (sessionData) => {
    const updatedVoterAuth = {
      ...voterAuth,
      ...sessionData
    }
    setVoterAuth(updatedVoterAuth)
    localStorage.setItem('voterAuth', JSON.stringify(updatedVoterAuth))
  }

  const clearVoterAuth = () => {
    setVoterAuth({
      isAuthenticated: false,
      email: null,
      provider: null,
      scrutinId: null,
      authorizedSessions: [],
      hasVoted: false,
      oauthToken: null
    })
    localStorage.removeItem('voterAuth')
  }

  const logout = () => {
    setUser(null)
    setAuthToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
    clearVoterAuth()
    toast.success('Déconnexion réussie')
  }

  const verifyEmail = async (email) => {
    // Check if email belongs to an allowed voter (placeholder for now)
    return true
  }

  const updateUser = (newData) => {
    const updatedUser = { ...user, ...newData }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{
      user,
      authToken,
      loading,
      login,
      loginWithGoogle,
      loginWithOffice365,
      loginWithToken,
      logout,
      verifyEmail,
      updateUser,
      // Voter authentication
      voterAuth,
      authenticateVoter,
      verifyVoterForScrutin,
      getAvailableScrutins,
      updateVoterSession,
      clearVoterAuth
    }}>
      {children}
    </AuthContext.Provider>
  )
}


export function useAuth() {
  return useContext(AuthContext)
}