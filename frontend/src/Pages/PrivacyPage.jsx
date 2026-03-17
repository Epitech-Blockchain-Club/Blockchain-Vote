import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheckIcon, LockClosedIcon, CpuChipIcon, EyeSlashIcon, DocumentCheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

const Section = ({ icon: Icon, title, children }) => (
  <div className="mb-12">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary-600" />
      </div>
      <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
    </div>
    <div className="pl-12 text-slate-500 text-sm leading-relaxed space-y-3">
      {children}
    </div>
  </div>
)

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <p className="text-xs font-black text-primary-600 tracking-[0.3em] uppercase mb-3">EpiVote</p>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4">
            Confidentialité &<br />
            <span className="text-primary-600">Smart Contracts</span>
          </h1>
          <p className="text-slate-500 text-base font-medium max-w-xl leading-relaxed">
            Comment EpiVote protège votre identité et garantit l'intégrité de chaque vote grâce à la blockchain.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-3xl">

        <Section icon={EyeSlashIcon} title="Anonymat par conception">
          <p>
            Votre identité n'est jamais stockée en clair. Lors de l'authentification, votre adresse e-mail est transformée en un hash cryptographique (SHA-256) avant d'être transmise au smart contract. Ce hash est irréversible : il est impossible de retrouver votre e-mail à partir de celui-ci.
          </p>
          <p>
            Aucun lien ne peut être établi entre un vote enregistré sur la blockchain et l'identité réelle de l'électeur. Même les administrateurs de la plateforme n'ont pas accès à cette information.
          </p>
        </Section>

        <Section icon={CpuChipIcon} title="Smart Contracts — comment ça fonctionne">
          <p>
            Un smart contract est un programme autonome déployé sur la blockchain Ethereum. Il s'exécute automatiquement lorsque des conditions définies sont remplies, sans intervention humaine possible.
          </p>
          <p>
            Sur EpiVote, chaque session de vote est un smart contract indépendant. Il contient :
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>La liste des électeurs autorisés (sous forme de hashes)</li>
            <li>Les candidats et options disponibles</li>
            <li>La logique anti-double vote</li>
            <li>Les résultats agrégés, mis à jour à chaque vote</li>
          </ul>
          <p>
            Une fois déployé, le code du contrat ne peut pas être modifié. Ni l'équipe EpiVote, ni les administrateurs, ni aucune tierce partie ne peut altérer son fonctionnement.
          </p>
        </Section>

        <Section icon={LockClosedIcon} title="Processus de validation des modérateurs">
          <p>
            Avant qu'une session de vote n'ouvre, elle doit être validée par un quorum de modérateurs indépendants. Chaque modérateur reçoit un lien unique et à usage unique pour exprimer son approbation ou son refus.
          </p>
          <p>
            Le consensus atteint, la validation est inscrite on-chain via une transaction signée. Ce mécanisme empêche toute ouverture non autorisée d'une session de vote.
          </p>
        </Section>

        <Section icon={DocumentCheckIcon} title="Immuabilité des résultats">
          <p>
            Chaque vote génère une transaction blockchain avec un hash unique (TX Hash). Ce hash est la preuve cryptographique que votre vote a bien été enregistré et ne pourra jamais être supprimé ni modifié.
          </p>
          <p>
            Les résultats sont calculés directement depuis les données on-chain, sans passer par une base de données intermédiaire susceptible d'être compromise.
          </p>
        </Section>

        <Section icon={GlobeAltIcon} title="Vérifiabilité publique">
          <p>
            Toutes les transactions liées aux votes sont publiques et consultables sur n'importe quel explorateur de blocs Ethereum (ex: Etherscan). N'importe qui peut auditer l'intégralité du processus électoral de manière indépendante.
          </p>
          <p>
            EpiVote met également à disposition un outil de vérification intégré permettant de contrôler qu'un TX Hash donné correspond bien à un vote valide enregistré sur le contrat concerné.
          </p>
        </Section>

        <Section icon={ShieldCheckIcon} title="Données collectées">
          <p>Les seules données traitées par EpiVote sont :</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-slate-700">Adresse e-mail</strong> — utilisée uniquement pour vérifier l'autorisation à voter, jamais stockée en clair on-chain</li>
            <li><strong className="text-slate-700">Hash de l'électeur</strong> — dérivé de l'e-mail, enregistré on-chain pour garantir l'unicité du vote</li>
            <li><strong className="text-slate-700">Choix de vote</strong> — enregistré on-chain de manière anonyme, non lié à l'identité</li>
          </ul>
          <p>
            Aucune donnée personnelle n'est revendue ni partagée avec des tiers. EpiVote ne conserve pas de cookies de tracking.
          </p>
        </Section>

        <div className="mt-8 pt-8 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-medium">Dernière mise à jour : mars 2026</p>
          <Link to="/" className="text-xs font-bold text-primary-600 hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPage
