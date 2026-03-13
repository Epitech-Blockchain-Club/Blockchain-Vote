# Blockchain-Vote (VoteChain)

Système de vote électronique décentralisé basé sur la blockchain Ethereum (EVM) avec une interface moderne et sécurisée.

## 🚀 Fonctionnalités
- **Décentralisation** : Les votes sont scellés sur la blockchain.
- **Sécurité** : Authentification OAuth2 (Google & Microsoft) et liens magiques.
- **Transparence** : Résultats vérifiables publiquement.
- **Performance** : Interface ultra-fluide avec Framer Motion.

## 🛠 Installation Locale

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## ☁️ Déploiement sur Render

Cette application est optimisée pour Render avec un mécanisme **Anti-Sommeil** intégré.

### Pré-requis
1. Un compte [Render](https://render.com).
2. Un RPC URL (Sepolia) via Alchemy ou Infura.
3. Le contrat `ScrutinFactory` déployé sur Sepolia.

### Étapes de déploiement
1. Poussez votre code sur GitHub.
2. Sur Render, allez dans **Blueprints** -> **New Blueprint Instance**.
3. Connectez votre dépôt. Render utilisera le fichier `render.yaml` à la racine.
4. Remplissez les variables d'environnement (voir `.env.production.example`).

### Mécanisme Anti-Sommeil
L'application s'auto-interroge toutes les 10 minutes sur son propre endpoint `/health` pour éviter que l'instance de serveur gratuite de Render ne s'endorme.

## 📁 Structure du projet
- `backend/` : Serveur Express (Node.js) + Hardhat (Smart Contracts).
- `frontend/` : Application React (Vite.js).
- `render.yaml` : Configuration Blueprint pour Render.
- `.env.production.example` : Modèle de configuration pour la production.

---
Built with ❤️ by Epitech Blockchain Club.
