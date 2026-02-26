import React from 'react'
import { Link } from 'react-router-dom'
import { useElections } from '../contexts/ElectionContext'
import ElectionList from '../components/elections/ElectionList'
import Button from '../components/common/Button'
import { ShieldCheckIcon, LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

const HomePage = () => {
  const { elections, loading } = useElections()

  const features = [
    {
      icon: <ShieldCheckIcon className="h-8 w-8 text-primary-500" />,
      title: 'Sécurisé',
      description: 'Votes enregistrés sur la blockchain, infalsifiables'
    },
    {
      icon: <LockClosedIcon className="h-8 w-8 text-primary-500" />,
      title: 'Anonyme',
      description: 'Votre identité reste confidentielle'
    },
    {
      icon: <GlobeAltIcon className="h-8 w-8 text-primary-500" />,
      title: 'Transparent',
      description: 'Résultats vérifiables par tous'
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-900 to-gray-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Plateforme de Vote Décentralisée
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Participez à des élections transparentes et sécurisées grâce à la technologie blockchain
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/voter">
              <Button size="lg" variant="primary">
                Voter maintenant
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline">
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Pourquoi choisir notre plateforme ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Elections en cours */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">Élections en cours</h2>
            <Link to="/results" className="text-primary-400 hover:text-primary-300">
              Voir tous les résultats →
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Chargement...</p>
            </div>
          ) : (
            <ElectionList 
              elections={elections.filter(e => {
                const now = new Date()
                return now >= new Date(e.startDate) && now <= new Date(e.endDate)
              })} 
            />
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage