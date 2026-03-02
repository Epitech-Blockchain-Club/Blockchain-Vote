import React from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import epitechLogo from '../../assets/epitech-logo.png'
import clubLogo from '../../assets/club-logo.jpg'
import { useSettings } from '../../contexts/SettingsContext'

const Footer = () => {
  const { t } = useSettings()
  return (
    <footer className="relative mt-auto pt-20 pb-10 overflow-hidden bg-white border-t border-slate-200 transition-colors duration-300">
      {/* Subtle glow effect removed as it might look better on pure white or be subtle */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-primary-500/5 blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-slate-200">
          <div className="md:col-span-5">
            <Link to={ROUTES.HOME} className="flex flex-col mb-8 group">
              <div className="flex items-center space-x-4 mb-4">
                <img src={epitechLogo} alt="Epitech" className="h-12 w-auto group-hover:scale-105 transition-all duration-500" />
                <span className="text-2xl font-black text-slate-300 mx-2">×</span>
                <img src={clubLogo} alt="Club" className="h-12 w-auto rounded-xl border border-slate-200 group-hover:border-primary-400 transition-all duration-500 shadow-sm" />
              </div>
              <span className="text-3xl font-black text-slate-900 tracking-tighter group-hover:text-primary-600 transition-colors">VoteChain</span>
            </Link>
            <p className="text-slate-600 text-lg max-w-sm leading-relaxed mb-8">
              {t({
                fr: "La passerelle sécurisée pour la gouvernance de l'Epitech Blockchain Club, en collaboration avec l'Epitech Blockchain Association. Intégrité, transparence et anonymat.",
                en: "The secure gateway for Epitech Blockchain Club governance, in collaboration with the Epitech Blockchain Association. Integrity, transparency, and anonymity."
              })}
            </p>
            <div className="flex space-x-4">
              {/* Social placeholders or club links */}
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center hover:bg-primary-50 transition-colors cursor-pointer border border-slate-200 shadow-sm">
                <svg className="w-5 h-5 text-slate-600 hover:text-primary-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.341-3.369-1.341-.454-1.152-1.11-1.459-1.11-1.459-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.376.202 2.394.1 2.646.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"></path></svg>
              </div>
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center hover:bg-secondary-50 transition-colors cursor-pointer border border-slate-200 shadow-sm">
                <svg className="w-5 h-5 text-slate-600 hover:text-secondary-600" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path></svg>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-slate-900 font-bold mb-6 tracking-wide">{t({ fr: 'Plateforme', en: 'Platform' })}</h4>
            <ul className="space-y-4">
              <li><Link to={ROUTES.HOME} className="text-slate-600 hover:text-primary-600 text-sm transition-colors">{t({ fr: 'Accueil', en: 'Home' })}</Link></li>
              <li><Link to={ROUTES.VOTER} className="text-slate-600 hover:text-primary-600 text-sm transition-colors">{t({ fr: 'Voter', en: 'Vote' })}</Link></li>
              <li><Link to={ROUTES.RESULTS} className="text-slate-600 hover:text-primary-600 text-sm transition-colors">{t({ fr: 'Résultats', en: 'Results' })}</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-slate-900 font-bold mb-6 tracking-wide">{t({ fr: 'Ressources', en: 'Resources' })}</h4>
            <ul className="space-y-4">
              <li><Link to="#" className="text-slate-600 hover:text-primary-600 text-sm transition-colors">Smart Contracts</Link></li>
              <li><Link to="#" className="text-slate-600 hover:text-primary-600 text-sm transition-colors">Documentation</Link></li>
              <li><Link to="#" className="text-slate-600 hover:text-primary-600 text-sm transition-colors">{t({ fr: 'Légal', en: 'Legal' })}</Link></li>
              <li><Link to="#" className="text-slate-600 hover:text-primary-600 text-sm transition-colors">{t({ fr: 'Confidentialité', en: 'Privacy' })}</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-slate-900 font-bold mb-6 tracking-wide">Status System</h4>
            <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 mb-4 shadow-sm">
              <div className="flex items-center space-x-2 text-primary-600 text-xs font-bold uppercase tracking-wider mb-2">
                <div className="h-2 w-2 bg-primary-500 rounded-full animate-pulse"></div>
                <span>Mainnet Active</span>
              </div>
              <p className="text-slate-600 text-[10px] leading-tight font-medium">
                {t({
                  fr: 'Tous les services sont opérationnels. Les votes sont enregistrés en temps réel.',
                  en: 'All services are operational. Votes are recorded in real-time.'
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} Epitech Blockchain Club. Built with ❤️ by the community.
          </p>
          <div className="flex items-center space-x-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <span className="hover:text-primary-600 transition-colors cursor-pointer">Security</span>
            <span className="hover:text-primary-600 transition-colors cursor-pointer">Uptime</span>
            <span className="hover:text-primary-600 transition-colors cursor-pointer">API</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer