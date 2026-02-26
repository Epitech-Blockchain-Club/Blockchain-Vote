import React from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

const Footer = () => {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Epitech Vote</h3>
            <p className="text-gray-400 text-sm">
              Plateforme de vote décentralisée pour des élections transparentes et sécurisées.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Liens rapides</h4>
            <ul className="space-y-2">
              <li><Link to={ROUTES.HOME} className="text-gray-400 hover:text-white text-sm">Accueil</Link></li>
              <li><Link to={ROUTES.VOTER} className="text-gray-400 hover:text-white text-sm">Voter</Link></li>
              <li><Link to={ROUTES.RESULTS} className="text-gray-400 hover:text-white text-sm">Résultats</Link></li>
              <li><Link to={ROUTES.ABOUT} className="text-gray-400 hover:text-white text-sm">À propos</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Légal</h4>
            <ul className="space-y-2">
              <li><Link to="#" className="text-gray-400 hover:text-white text-sm">Mentions légales</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white text-sm">Politique de confidentialité</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white text-sm">CGU</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">support@epitech-vote.com</li>
              <li className="text-gray-400 text-sm">+33 1 23 45 67 89</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Epitech Blockchain Club. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer