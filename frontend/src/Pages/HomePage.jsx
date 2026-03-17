import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useSettings } from '../contexts/SettingsContext'
import Button from '../components/common/Button'
import {
  ShieldCheckIcon,
  LockClosedIcon,
  GlobeAltIcon,
  ChevronRightIcon,
  CpuChipIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'

const HomePage = () => {
  const { user } = useAuth()
  const { t } = useSettings()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (user?.role === 'admin') navigate('/admin')
  }, [user, navigate])

  const benefits = [
    {
      icon: <CpuChipIcon className="h-6 w-6 text-primary-600" />,
      title: t({ fr: 'Résultats immuables', en: 'Immutable results' }),
      description: t({
        fr: 'Chaque vote est gravé sur la blockchain. Impossible à modifier, supprimer ou falsifier — même par les administrateurs.',
        en: 'Every vote is written to the blockchain. Impossible to alter, delete or forge — even by administrators.',
      }),
    },
    {
      icon: <LockClosedIcon className="h-6 w-6 text-primary-600" />,
      title: t({ fr: 'Anonymat cryptographique', en: 'Cryptographic anonymity' }),
      description: t({
        fr: "Votre identité est hachée avant d'être transmise. Aucun lien ne peut être établi entre vous et votre vote.",
        en: 'Your identity is hashed before transmission. No link can be established between you and your vote.',
      }),
    },
    {
      icon: <GlobeAltIcon className="h-6 w-6 text-primary-600" />,
      title: t({ fr: 'Vérifiable par tous', en: 'Verifiable by all' }),
      description: t({
        fr: "N'importe qui peut auditer les résultats via le registre public. La transparence est garantie par le protocole, pas par une promesse.",
        en: 'Anyone can audit the results via the public ledger. Transparency is guaranteed by the protocol, not a promise.',
      }),
    },
  ]

  return (
    <div className="overflow-hidden bg-white">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[1000px] h-[1000px] bg-primary-100/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Text */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9]"
              >
                {t({ fr: 'Votre vote sécurisé', en: 'Secure vote' })} <br />
                <span className="text-primary-600">{t({ fr: 'par la blockchain.', en: 'on the blockchain.' })}</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-xl text-slate-500 mb-12 max-w-2xl leading-relaxed font-semibold"
              >
                {t({
                  fr: "Chaque vote est enregistré de manière immuable sur la blockchain — impossible à modifier, anonyme par conception, et vérifiable publiquement par n'importe qui.",
                  en: "Every vote is recorded immutably on the blockchain — impossible to alter, anonymous by design, and publicly verifiable by anyone.",
                })}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
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
                  <Link to="/voter">
                    <Button size="lg" className="h-16 px-12 text-lg group rounded-2xl shadow-xl shadow-primary-500/20">
                      {t({ fr: 'Voter', en: 'Vote' })}
                      <ChevronRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                )}
              </motion.div>
            </div>

            {/* Image */}
            <div className="lg:w-1/2 relative py-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="relative z-10"
              >
                <img
                  src="/man-with-i-voted-today-sticker.jpg"
                  alt="Voter avec EpiVote"
                  className="rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 object-cover aspect-square sm:aspect-auto"
                />
                <motion.div
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}
                  className="absolute -top-10 -right-10 w-40 h-40 bg-white p-4 rounded-3xl shadow-xl border border-slate-50 hidden xl:flex items-center justify-center p-6"
                >
                  <img src="/club-logo.jpg" alt="Club Logo" className="w-full h-full object-contain" />
                </motion.div>
                <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 hidden md:block animate-bounce-slow">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-primary-500 rounded-2xl flex items-center justify-center">
                      <ShieldCheckIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Statut</p>
                      <p className="text-lg font-black text-slate-900">{t({ fr: '100% Immuable', en: '100% Immutable' })}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-100/10 rounded-full blur-[100px] -z-10" />
            </div>

          </div>
        </div>
      </section>

      {/* ── Avantages blockchain ───────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-black text-primary-600 tracking-[0.3em] uppercase mb-3">
              {t({ fr: 'Pourquoi la blockchain ?', en: 'Why blockchain?' })}
            </p>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter">
              {t({ fr: 'La confiance par le protocole,', en: 'Trust by protocol,' })}<br />
              <span className="text-primary-600">{t({ fr: 'pas par la parole.', en: 'not by words.' })}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-11 h-11 bg-primary-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary-100 transition-colors">
                  {b.icon}
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight">{b.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Protocole ─────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-black text-primary-600 tracking-[0.3em] uppercase mb-3">
              {t({ fr: 'Le protocole', en: 'The protocol' })}
            </p>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter">
              {t({ fr: 'Comment fonctionne un vote ?', en: 'How does a vote work?' })}
            </h2>
          </div>
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { step: 1, title: t({ fr: 'Identification', en: 'Identification' }), desc: t({ fr: 'Email institutionnel', en: 'Institutional email' }) },
              { step: 2, title: t({ fr: 'Hachage', en: 'Hashing' }), desc: t({ fr: 'Identité chiffrée', en: 'Encrypted identity' }) },
              { step: 3, title: t({ fr: 'Scellage', en: 'Sealing' }), desc: t({ fr: 'Smart Contract', en: 'Smart Contract' }) },
              { step: 4, title: t({ fr: 'Preuve', en: 'Proof' }), desc: t({ fr: 'TX Hash reçu', en: 'TX Hash received' }) },
              { step: 5, title: t({ fr: 'Résultat', en: 'Result' }), desc: t({ fr: 'Dépouillement certifié', en: 'Certified count' }) },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: idx * 0.07 }}
                className="relative bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="absolute -top-3 -right-3 text-7xl font-black text-primary-500/5 group-hover:text-primary-500/10 transition-colors select-none">{item.step}</div>
                <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary-600 font-black text-sm">{item.step}</span>
                </div>
                <h4 className="text-xs font-black text-slate-900 mb-1">{item.title}</h4>
                <p className="text-[10px] text-slate-400 font-medium leading-tight">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4">
        <div className="container mx-auto">
          <div className="bg-slate-900 rounded-3xl p-10 sm:p-16 relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tighter">
                {t({ fr: 'Prêt à voter ?', en: 'Ready to vote?' })}
              </h2>
              <p className="text-slate-400 text-base mb-8 max-w-md mx-auto font-medium">
                {t({
                  fr: 'Connectez-vous avec votre email institutionnel. Simple, rapide, et sécurisé par la blockchain.',
                  en: 'Sign in with your institutional email. Simple, fast, and secured by the blockchain.',
                })}
              </p>
              <Link to="/voter">
                <button className="h-12 px-8 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all shadow-lg">
                  {t({ fr: 'Démarrer maintenant', en: 'Start now' })}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default HomePage
