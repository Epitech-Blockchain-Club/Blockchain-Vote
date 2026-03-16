import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useElections } from '../contexts/ElectionContext'
import { useSettings } from '../contexts/SettingsContext'
import ElectionList from '../components/elections/ElectionList'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import {
  ShieldCheckIcon,
  LockClosedIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  CpuChipIcon,
  ChevronRightIcon,
  CodeBracketIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

const HomePage = () => {
  const { elections, loading } = useElections()
  const { user } = useAuth()
  const { t } = useSettings()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin')
    }
  }, [user, navigate])

  const features = [
    {
      icon: <img src="/home/brouhane/.gemini/antigravity/brain/6a9ce6e4-e2b9-433b-907c-20420c33a8b6/secure_vote_feature_1772381531717.png" alt="Secure" className="h-12 w-12 object-contain" />,
      title: t({ fr: 'Sécurité Blockchain', en: 'Blockchain Security' }),
      description: t({
        fr: "Chaque vote est enregistré de manière immuable sur la blockchain, garantissant l'intégrité totale des résultats.",
        en: "Every vote is unalterably recorded on the blockchain, ensuring total integrity of the results."
      })
    },
    {
      icon: <LockClosedIcon className="h-8 w-8 text-primary-600" />,
      title: t({ fr: 'Anonymat Garanti', en: 'Guaranteed Anonymity' }),
      description: t({
        fr: "Votre identité est protégée par des mécanismes cryptographiques qui empêchent de lier un vote à un individu.",
        en: "Your identity is protected by cryptographic mechanisms that prevent linking a vote to an individual."
      })
    },
    {
      icon: <GlobeAltIcon className="h-8 w-8 text-primary-600" />,
      title: t({ fr: 'Transparence Totale', en: 'Total Transparency' }),
      description: t({
        fr: "Tous les scrutins sont publics et vérifiables par la communauté à tout moment sur le registre décentralisé.",
        en: "All ballots are public and verifiable by the community at any time on the decentralized ledger."
      })
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <div className="overflow-hidden bg-white">

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[1000px] h-[1000px] bg-primary-100/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9]"
              >
                {t({ fr: "L'avenir du vote est", en: "The future of voting is" })} <br />
                <span className="text-primary-600">{t({ fr: 'décentralisé.', en: 'decentralized.' })}</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-slate-500 mb-12 max-w-2xl leading-relaxed font-semibold"
              >
                {t({
                  fr: "Restaurez la confiance dans la gouvernance institutionnelle grâce à une architecture inaltérable, transparente et totalement anonyme.",
                  en: "Restore trust in institutional governance with an unalterable, transparent, and completely anonymous architecture."
                })}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start"
              >
                {user?.role === 'admin' ? (
                  <Link to="/admin/elections/new">
                    <Button size="lg" className="h-16 px-12 text-lg group rounded-2xl shadow-xl shadow-primary-500/20">
                      {t({ fr: 'Créer un scrutin', en: 'Create Ballot' })}
                      <PlusIcon className="h-5 w-5 ml-2 group-hover:rotate-90 transition-transform" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/request-vote">
                    <Button size="lg" className="h-16 px-12 text-lg group rounded-2xl shadow-xl shadow-primary-500/20">
                      {t({ fr: 'Lancer un vote', en: 'Start Voting' })}
                      <ChevronRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                )}
                <Link to="/voter">
                  <Button variant="outline" size="lg" className="h-16 px-12 text-lg rounded-2xl border-2">
                    {t({ fr: 'Voter', en: 'Vote' })}
                  </Button>
                </Link>
              </motion.div>
            </div>
            <div className="lg:w-1/2 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10"
              >
                <img
                  src="/man-with-i-voted-today-sticker.jpg"
                  alt="High Tech Voting"
                  className="rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 object-cover aspect-square sm:aspect-auto"
                />
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute -top-10 -right-10 w-40 h-40 bg-white p-4 rounded-3xl shadow-xl border border-slate-50 hidden xl:flex items-center justify-center p-6"
                >
                  <img src="/src/assets/club-logo.jpg" alt="Club Logo" className="w-full h-full object-contain" />
                </motion.div>
                <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 hidden md:block animate-bounce-slow">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-primary-500 rounded-2xl flex items-center justify-center">
                      <ShieldCheckIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Status</p>
                      <p className="text-lg font-black text-slate-900">{t({ fr: '100% Immuable', en: '100% Immutable' })}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-100/10 rounded-full blur-[100px] -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="py-24 bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-24 opacity-10 pointer-events-none">
          <ShieldCheckIcon className="w-96 h-96 text-white" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-sm font-black text-primary-400 tracking-[0.4em] uppercase mb-12">Notre Manifeste</h2>
            <p className="text-white text-3xl md:text-5xl font-black leading-[1.1] tracking-tight mb-16">
              {t({
                fr: '"Rendre les élections plus démocratiques grâce à la blockchain, en éliminant toute possibilité de manipulation et en garantissant une auditabilité permanente."',
                en: '"Making elections more democratic through blockchain, eliminating any possibility of manipulation and ensuring permanent auditability."'
              })}
            </p>
            <div className="h-1 w-24 bg-primary-500 mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-sm font-black text-primary-600 tracking-[0.3em] uppercase mb-4">Architecture</h2>
            <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
              Pourquoi choisir la <span className="text-primary-600 italic">Blockchain</span> ?
            </h3>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                  <div className="mb-8 p-6 bg-slate-50 w-fit rounded-3xl group-hover:bg-primary-50 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{feature.title}</h3>
                  <p className="text-slate-500 font-semibold leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Protocol / How it works */}
      <section className="py-32 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-sm font-black text-primary-600 tracking-[0.3em] uppercase mb-4">Le Protocole</h2>
            <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">Comment se déroule <br />le cycle de vote</h3>
          </div>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { step: 1, title: t({ fr: "Identification", en: "Identification" }), desc: t({ fr: "Auth via email institutionnel.", en: "Auth via institutional email." }) },
                { step: 2, title: t({ fr: "Cryptographie", en: "Cryptography" }), desc: t({ fr: "Hachage de l'identité.", en: "Identity hashing." }) },
                { step: 3, title: t({ fr: "Scellage", en: "Sealing" }), desc: t({ fr: "Envoi au Smart Contract.", en: "Sending to Smart Contract." }) },
                { step: 4, title: t({ fr: "Preuve", en: "Proof" }), desc: t({ fr: "Réception du TX Hash.", en: "Receiving TX Hash." }) },
                { step: 5, title: t({ fr: "Consensus", en: "Consensus" }), desc: t({ fr: "Dépouillement certifié.", en: "Certified counting." }) }
              ].map((item, idx) => (
                <div key={idx} className="relative p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                  <div className="absolute -top-4 -right-4 text-8xl font-black text-primary-500/5 group-hover:text-primary-500/10 transition-colors">{item.step}</div>
                  <div className="relative z-10">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-6">
                      <span className="text-primary-600 font-black">{item.step}</span>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-2">{item.title}</h4>
                    <p className="text-slate-500 text-sm font-semibold leading-tight">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Active Elections */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-20 gap-8">
            <div>
              <h2 className="text-sm font-black text-primary-600 tracking-[0.3em] uppercase mb-4">{t({ fr: 'Scrutins Live', en: 'Live Ballots' })}</h2>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">{t({ fr: 'Élections en cours', en: 'Ongoing Elections' })}</h3>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-slate-50 rounded-[40px] animate-pulse border border-slate-100"></div>
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="absolute -inset-10 bg-primary-100/5 rounded-[100px] blur-3xl"></div>
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

      {/* Final CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-slate-900 rounded-[60px] p-16 md:p-32 relative overflow-hidden text-center shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent"></div>
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-5xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-none">
                {t({ fr: 'Prêt à sceller votre vote ?', en: 'Ready to seal your vote?' })}
              </h2>
              <p className="text-slate-400 text-xl mb-16 max-w-3xl mx-auto font-medium">
                {t({
                  fr: 'Utilisez votre token institutionnel pour participer à la gouvernance décentralisée. Simple, anonyme et mathématiquement prouvé.',
                  en: 'Use your institutional token to participate in decentralized governance. Simple, anonymous, and mathematically proven.'
                })}
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/voter">
                  <Button size="lg" className="h-20 px-16 text-xl rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black">
                    Démarrer maintenant
                  </Button>
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