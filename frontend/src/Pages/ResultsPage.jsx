import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useElections } from '../contexts/ElectionContext'
import ResultsChart from '../components/elections/ResultsChart'
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import Button from '../components/common/Button'

const ResultsPage = () => {
  const { id } = useParams()
  const { elections } = useElections()
  const [selectedElection, setSelectedElection] = useState(id || '')

  const election = elections.find(e => e.id === selectedElection)
  const now = new Date()
  const isEnded = election && new Date(election.endDate) < now

  const handleExport = () => {
    if (!election) return

    const data = {
      election: election.title,
      date: new Date().toLocaleString(),
      results: election.candidates.map(c => ({
        candidat: c.name,
        votes: election.votes?.[c.id] || 0
      }))
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resultats-${election.id}.json`
    a.click()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Résultats des scrutins</h1>
        <p className="text-slate-500 font-medium italic">Consultez les résultats certifiés par la blockchain</p>
      </div>

      {/* Sélecteur d'élection */}
      <div className="mb-10">
        <select
          value={selectedElection}
          onChange={(e) => setSelectedElection(e.target.value)}
          className="w-full md:w-96 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all font-medium appearance-none cursor-pointer shadow-sm"
        >
          <option value="">Sélectionnez un scrutin pour voir les chiffres</option>
          {elections.map(e => (
            <option key={e.id} value={e.id}>
              {e.title} • {new Date(e.endDate).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {election ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isEnded ? 'bg-slate-50 text-slate-500 border-slate-100' : 'bg-primary-50 text-primary-600 border-primary-100 animate-pulse'}`}>
                  {isEnded ? 'Scrutin clôturé' : 'Vote en cours'}
                </span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">{election.title}</h2>
              <p className="text-slate-500 font-medium leading-relaxed max-w-2xl">{election.description}</p>
            </div>
            {isEnded && (
              <Button onClick={handleExport} variant="outline" size="sm" className="border-slate-200 text-slate-500 h-10 px-6 rounded-xl">
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Détails JSON
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Période de vote</p>
              <p className="text-slate-900 font-bold text-sm">
                {new Date(election.startDate).toLocaleDateString()} — {new Date(election.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total participation</p>
              <p className="text-primary-600 font-black text-xl">
                {Object.values(election.votes || {}).reduce((a, b) => a + b, 0)} <span className="text-slate-400 text-xs font-medium uppercase tracking-tighter">Votants certifiés</span>
              </p>
            </div>
          </div>

          {!isEnded && (
            <div className="mb-10 p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start space-x-3">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-amber-100 mt-0.5">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-amber-700 text-xs font-medium leading-relaxed">
                Les résultats affichés sont partiels et calculés en temps réel. Ils ne deviendront officiels et certifiés qu'à la clôture définitive du scrutin.
              </p>
            </div>
          )}

          {/* Graphique des résultats */}
          <div className="h-96 mb-8">
            <ResultsChart election={election} />
          </div>

          {/* Tableau détaillé */}
          <div className="overflow-x-auto border border-slate-100 rounded-3xl mb-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Participant / Option</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Nombre de voix</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Pourcentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {election.candidates.map(candidate => {
                  const votes = election.votes?.[candidate.id] || 0
                  const total = Object.values(election.votes || {}).reduce((a, b) => a + b, 0)
                  const percentage = total > 0 ? ((votes / total) * 100).toFixed(1) : 0

                  return (
                    <tr key={candidate.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <p className="text-slate-900 font-bold group-hover:text-primary-600 transition-colors">{candidate.name}</p>
                      </td>
                      <td className="text-right py-4 px-6 text-slate-900 font-black">{votes}</td>
                      <td className="text-right py-4 px-6">
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-slate-400 text-xs font-bold">{percentage}%</span>
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Lien de vérification blockchain */}
          <div className="p-6 bg-slate-900 rounded-3xl shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <svg className="w-32 h-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Certificat Blockchain</h3>
            <p className="text-white font-medium mb-6 text-sm max-w-xl">
              Les résultats ci-dessus sont hachés et scellés cryptographiquement. Vous pouvez vérifier l'intégrité de ce scrutin sur l'explorateur de blocs via l'adresse du contrat intelligent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 w-full bg-slate-800 p-3 rounded-xl border border-slate-700 font-mono text-[10px] text-primary-400 break-all">
                0x742d35Cc6634C0532925a3b844BcAc4e4f3e6e5a
              </div>
              <Link to="/verify" className="w-full sm:w-auto">
                <Button size="sm" className="w-full bg-white text-slate-900 hover:bg-slate-100 h-10 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest">
                  Vérifier
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-32 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <div className="h-20 w-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 mx-auto">
            <svg className="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.2em]">Sélectionnez un scrutin pour l'analyse des résultats</p>
        </div>
      )}
    </div>
  )
}

export default ResultsPage