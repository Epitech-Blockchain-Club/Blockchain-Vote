import React from 'react'
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  GlobeAltIcon,
  CodeBracketIcon,
  UserGroupIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline'

const AboutPage = () => {
  const features = [
    {
      icon: <ShieldCheckIcon className="h-8 w-8 text-primary-500" />,
      title: 'Sécurité Blockchain',
      description: 'Chaque vote est enregistré de manière immuable sur la blockchain, garantissant l\'intégrité des résultats.'
    },
    {
      icon: <LockClosedIcon className="h-8 w-8 text-primary-500" />,
      title: 'Anonymat Garanti',
      description: 'Votre identité est protégée grâce à un système de hachage qui empêche de lier un vote à un votant.'
    },
    {
      icon: <GlobeAltIcon className="h-8 w-8 text-primary-500" />,
      title: 'Transparence Totale',
      description: 'Tous les votes sont publics et vérifiables par n\'importe qui, à tout moment.'
    },
    {
      icon: <CodeBracketIcon className="h-8 w-8 text-primary-500" />,
      title: 'Open Source',
      description: 'Le code de la plateforme est ouvert et auditable par la communauté.'
    },
    {
      icon: <UserGroupIcon className="h-8 w-8 text-primary-500" />,
      title: 'Multi-élections',
      description: 'Organisez plusieurs élections simultanément avec des collèges électoraux distincts.'
    },
    {
      icon: <DocumentCheckIcon className="h-8 w-8 text-primary-500" />,
      title: 'Vérification Individuelle',
      description: 'Chaque votant peut vérifier que son vote a bien été compté.'
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-900 to-gray-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            À propos de la plateforme
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Une solution de vote décentralisée conçue pour garantir des élections 
            libres, transparentes et sécurisées
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Notre Mission</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Rendre les élections plus démocratiques en utilisant la technologie blockchain 
              pour éliminer la fraude électorale et garantir la transparence. Nous croyons 
              que chaque voix compte et mérite d'être comptée de manière juste et vérifiable.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Fonctionnalités clés
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-6">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Comment ça marche ?
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-600"></div>
              
              {[
                {
                  step: 1,
                  title: "Inscription",
                  description: "Les électeurs reçoivent un lien unique par email ou s'identifient avec leur adresse email."
                },
                {
                  step: 2,
                  title: "Vérification",
                  description: "Le système vérifie l'éligibilité de l'électeur et génère un identifiant anonyme."
                },
                {
                  step: 3,
                  title: "Vote",
                  description: "L'électeur choisit son candidat et son vote est enregistré sur la blockchain."
                },
                {
                  step: 4,
                  title: "Confirmation",
                  description: "Un hash de transaction est généré, permettant à l'électeur de vérifier son vote."
                },
                {
                  step: 5,
                  title: "Dépouillement",
                  description: "Les résultats sont automatiquement calculés et visibles par tous en temps réel."
                }
              ].map((item) => (
                <div key={item.step} className="relative pl-20 pb-12">
                  <div className="absolute left-4 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage