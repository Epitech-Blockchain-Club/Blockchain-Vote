import React, { useState } from 'react'
import Button from '../common/Button'
import { EnvelopeIcon, CheckCircleIcon, MagnifyingGlassIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useElections } from '../../contexts/ElectionContext'
import { useSettings } from '../../contexts/SettingsContext'

const EmailVerification = ({ onVerified }) => {
  const { elections } = useElections()
  const { t } = useSettings()
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const availableSessions = elections.filter(e => {
    const now = new Date()
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase())
    return now >= new Date(e.startDate) && now <= new Date(e.endDate) && matchesSearch
  })

  const handleVerify = async () => {
    setVerifying(true)
    // Simuler une vérification
    setTimeout(() => {
      setVerified(true)
      setVerifying(false)
      const session = elections.find(e => e.id === selectedSessionId)
      onVerified?.({ email, country, sessionId: selectedSessionId, sessionTitle: session?.title })
    }, 1500)
  }

  if (verified) {
    return (
      <div className="text-center py-6 bg-primary-50 rounded-3xl border border-primary-100 animate-in fade-in zoom-in duration-500">
        <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 mx-auto">
          <CheckCircleIcon className="h-8 w-8 text-primary-500" />
        </div>
        <p className="text-primary-700 font-black uppercase text-xs tracking-widest">{t({ fr: 'Email vérifié avec succès !', en: 'Email verified successfully!' })}</p>
      </div>
    )
  }

  return (
    <div className="p-0">
      <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight flex items-center">
        <EnvelopeIcon className="h-6 w-6 mr-3 text-primary-500" />
        {t({ fr: "Vérification de l'email", en: "Email Verification" })}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
            {t({ fr: 'Email Institutionnel', en: 'Institutional Email' })}
          </label>
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all font-medium"
              placeholder="votre@email.com"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
            {t({ fr: 'Session de vote', en: 'Voting Session' })}
          </label>
          <div className="relative">
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus-within:ring-4 focus-within:ring-primary-500/10 focus-within:border-primary-500/50 transition-all font-medium cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center">
                <MagnifyingGlassIcon className="absolute left-3 h-5 w-5 text-gray-400" />
                <span className={selectedSessionId ? "text-slate-900" : "text-slate-400"}>
                  {selectedSessionId
                    ? availableSessions.find(s => s.id === selectedSessionId)?.title
                    : t({ fr: 'Rechercher une session...', en: 'Search for a session...' })}
                </span>
              </div>
              <ChevronRightIcon className={`h-5 w-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-90' : ''}`} />
            </div>

            {isDropdownOpen && (
              <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                  <input
                    type="text"
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t({ fr: 'Filtrer les sessions...', en: 'Filter sessions...' })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {availableSessions.length > 0 ? (
                    availableSessions.map(session => (
                      <div
                        key={session.id}
                        onClick={() => {
                          setSelectedSessionId(session.id)
                          setIsDropdownOpen(false)
                        }}
                        className={`px-4 py-3 hover:bg-primary-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0 ${selectedSessionId === session.id ? 'bg-primary-50' : ''
                          }`}
                      >
                        <p className={`text-sm font-bold ${selectedSessionId === session.id ? 'text-primary-600' : 'text-slate-700'}`}>
                          {session.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{session.scope}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-slate-400 text-sm italic">{t({ fr: 'Aucune session trouvée', en: 'No session found' })}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
            {t({ fr: 'Territoire de vote', en: 'Voting Territory' })}
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all font-medium appearance-none cursor-pointer"
          >
            <option value="">{t({ fr: 'Sélectionnez votre pays', en: 'Select your country' })}</option>
            <option value="FR">France</option>
            <option value="BJ">Bénin</option>
            <option value="SN">Sénégal</option>
            <option value="CI">Côte d'Ivoire</option>
          </select>
        </div>

        <Button
          onClick={handleVerify}
          loading={verifying}
          disabled={!email || !country || !selectedSessionId}
          className="w-full h-14 rounded-2xl shadow-lg shadow-primary-500/10"
        >
          {t({ fr: 'Vérifier mon identité', en: 'Verify my identity' })}
        </Button>
      </div>
    </div>
  )
}

export default EmailVerification