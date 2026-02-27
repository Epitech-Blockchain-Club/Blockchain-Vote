import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useElections } from '../contexts/ElectionContext'
import ElectionList from '../components/elections/ElectionList'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import {
  ShieldCheckIcon,
  LockClosedIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  CpuChipIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

const HomePage = () => {
  const { elections, loading } = useElections()

  const features = [
    {
      icon: <ShieldCheckIcon className="h-7 w-7 text-indigo-400" />,
      title: 'Sécurité Maximale',
      description: 'Chaque vote est hashé et stocké sur un registre décentralisé inaltérable.',
      color: 'indigo'
    },
    {
      icon: <LockClosedIcon className="h-7 w-7 text-purple-400" />,
      title: 'Anonymat Garanti',
      description: 'Votre identité est protégée par des preuves à divulgation nulle de connaissance.',
      color: 'purple'
    },
    {
      icon: <GlobeAltIcon className="h-7 w-7 text-blue-400" />,
      title: 'Transparence Totale',
      description: 'Vérifiez le bon déroulement de l\'élection en temps réel sur la blockchain.',
      color: 'blue'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }

  return (
    <div className="overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-bold mb-8 animate-float"
            >
              <CpuChipIcon className="h-4 w-4" />
              <span className="tracking-wider uppercase">Powered by Blockchain Technology</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight"
            >
              L'avenir du vote est <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                décentralisé & transparent.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Plateforme officielle de vote de l'Epitech Blockchain Club.
              Garantissez l'intégrité de chaque scrutin grâce à la puissance du Web3.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-5"
            >
              <Link to="/voter">
                <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-lg group">
                  Voter maintenant
                  <ChevronRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/results">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-10 text-lg">
                  Voir les résultats
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features with Cards */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-indigo-500 tracking-[0.3em] uppercase mb-4">Fonctionnement</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white">Une confiance sans intermédiaire</h3>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full border-t-2 border-indigo-500/20 group hover:border-indigo-500 transition-all duration-500">
                  <div className={`p-4 rounded-2xl bg-white/5 w-fit mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-bold text-white mb-4 tracking-tight">{feature.title}</h4>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Active Elections */}
      <section className="py-24 bg-slate-900/40 border-y border-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-6">
            <div>
              <h2 className="text-sm font-bold text-purple-500 tracking-[0.3em] uppercase mb-4">Scrutins</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-white">Élections en cours</h3>
            </div>
            <Link to="/results" className="group flex items-center text-slate-400 hover:text-white transition-colors font-semibold">
              Parcourir l'archive des votes
              <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-slate-800/50 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="absolute -inset-4 bg-indigo-500/5 rounded-[40px] blur-2xl"></div>
              <div className="relative">
                <ElectionList
                  elections={elections.filter(e => {
                    const now = new Date()
                    return now >= new Date(e.startDate) && now <= new Date(e.endDate)
                  })}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="card bg-gradient-to-br from-indigo-600 to-purple-800 border-none p-12 md:p-20 relative overflow-hidden text-center md:text-left">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none translate-x-1/4">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFFFFF" d="M47.7,-63.2C61.4,-54.1,71.8,-38.7,75.4,-22.3C79.1,-5.9,76.1,11.5,69,27.5C61.8,43.4,50.6,57.9,35.8,65.8C20.9,73.8,2.4,75.1,-15,70.6C-32.4,66.1,-48.6,55.8,-59.8,41.7C-71.1,27.5,-77.3,9.5,-75.4,-7.8C-73.5,-25.1,-63.5,-41.7,-49.4,-50.7C-35.3,-59.7,-17.1,-61,-0.1,-60.9C17,-60.8,33.9,-72.4,47.7,-63.2Z" transform="translate(100 100)" />
              </svg>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Prêt à changer la donne ?</h2>
              <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
                Rejoignez la communauté Epitech Blockchain et participez à la gouvernance de demain dès aujourd'hui.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/login" className="bg-white text-indigo-700 hover:bg-slate-100 px-8 py-4 rounded-xl font-bold shadow-xl transition-all hover:-translate-y-1">
                  Créer un compte
                </Link>
                <Link to="/about" className="bg-indigo-500/20 backdrop-blur-md border border-white/20 text-white hover:bg-indigo-500/30 px-8 py-4 rounded-xl font-bold transition-all hover:-translate-y-1">
                  En savoir plus
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage