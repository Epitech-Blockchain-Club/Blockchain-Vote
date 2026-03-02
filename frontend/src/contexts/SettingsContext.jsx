import React, { createContext, useState, useContext, useEffect } from 'react'

const SettingsContext = createContext()

export function SettingsProvider({ children }) {
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'fr')

    useEffect(() => {
        document.documentElement.classList.remove('dark')
    }, [])

    useEffect(() => {
        localStorage.setItem('language', language)
    }, [language])

    const toggleLanguage = () => setLanguage(prev => prev === 'fr' ? 'en' : 'fr')

    const t = (translations) => {
        return translations[language] || translations['fr']
    }

    return (
        <SettingsContext.Provider value={{
            language,
            setLanguage,
            toggleLanguage,
            t
        }}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const context = useContext(SettingsContext)
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider')
    }
    return context
}
