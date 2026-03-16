#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Script de configuration des secrets GitHub Actions pour EpiVote
# Prérequis : gh CLI installé et authentifié (gh auth login)
# Usage    : bash .github/set-secrets.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)
if [ -z "$REPO" ]; then
  echo "❌ Impossible de détecter le repo. Lancez 'gh auth login' d'abord."
  exit 1
fi
echo "📦 Repo détecté : $REPO"
echo ""

prompt() {
  local name=$1
  local hint=$2
  local default=$3
  if [ -n "$default" ]; then
    read -rp "  $name ($hint) [défaut: $default] : " val
    val="${val:-$default}"
  else
    read -rsp "  $name ($hint) : " val
    echo ""
  fi
  gh secret set "$name" --body "$val" --repo "$REPO"
  echo "  ✓ $name"
}

# ── Serveur SSH ───────────────────────────────────────────────────────────────
echo "🖥️  SERVEUR SSH"
prompt "SSH_HOST"        "IP ou domaine du serveur"
prompt "SSH_USER"        "Utilisateur SSH"                    "ubuntu"
prompt "SSH_PORT"        "Port SSH"                           "22"
prompt "SSH_PRIVATE_KEY" "Clé privée SSH (contenu complet)"
prompt "DEPLOY_PATH"     "Chemin du repo sur le serveur"      "/opt/epivote"
echo ""

# ── Backend ───────────────────────────────────────────────────────────────────
echo "⚙️  BACKEND"
prompt "BACKEND_PORT"   "Port d'écoute du backend"           "3001"
prompt "CLIENT_URL"     "URL du client frontend"             "http://localhost"
prompt "FRONTEND_URL"   "URL du frontend"                    "http://localhost"
echo ""

# ── MongoDB ───────────────────────────────────────────────────────────────────
echo "🗄️  MONGODB"
prompt "MONGO_INITDB_ROOT_USERNAME" "Username admin MongoDB"  "admin"
prompt "MONGO_INITDB_ROOT_PASSWORD" "Mot de passe admin MongoDB"
prompt "MONGO_URI"                  "URI complète MongoDB"
echo ""

# ── Sécurité ──────────────────────────────────────────────────────────────────
echo "🔐 SÉCURITÉ"
prompt "JWT_SECRET" "Clé JWT 32+ chars (openssl rand -hex 32)"
echo ""

# ── SMTP ──────────────────────────────────────────────────────────────────────
echo "📧 SMTP"
prompt "SMTP_HOST" "Serveur SMTP"                            "smtp.gmail.com"
prompt "SMTP_PORT" "Port SMTP"                               "587"
prompt "SMTP_USER" "Email expéditeur"
prompt "SMTP_PASS" "Mot de passe SMTP (app password)"
prompt "SMTP_FROM" "Nom affiché dans les emails"             "EpiVote <no-reply@epivote.epitech.eu>"
echo ""

# ── OAuth ─────────────────────────────────────────────────────────────────────
echo "🔑 OAUTH (partagés frontend + backend)"
prompt "VITE_GOOGLE_CLIENT_ID"    "Google Client ID"
prompt "VITE_MICROSOFT_CLIENT_ID" "Microsoft Client ID"
prompt "VITE_MICROSOFT_TENANT_ID" "Microsoft Tenant ID"
echo ""

# ── Frontend ──────────────────────────────────────────────────────────────────
echo "🌐 FRONTEND"
prompt "VITE_APP_ENV" "Environnement Vite"                   "production"
prompt "VITE_API_URL" "URL de l'API (relatif ou absolu)"     "/api"
echo ""

# ── Blockchain ────────────────────────────────────────────────────────────────
echo "⛓️  BLOCKCHAIN"
prompt "RPC_URL"              "URL RPC du nœud Besu"         "http://besu-node:8545"
prompt "BLOCKCHAIN_PRIVATE_KEY" "Clé privée du compte déployeur (0x...)"
echo ""

# ── Comptes initiaux ──────────────────────────────────────────────────────────
echo "👤 COMPTES INITIAUX"
prompt "INITIAL_SUPERADMIN_EMAIL"    "Email superadmin"      "super@epivote.epitech.eu"
prompt "INITIAL_SUPERADMIN_PASSWORD" "Mot de passe superadmin (fort !)"
prompt "INITIAL_ADMIN_EMAIL"         "Email admin"           "admin@epivote.epitech.eu"
prompt "INITIAL_ADMIN_PASSWORD"      "Mot de passe admin (fort !)"
echo ""

echo "────────────────────────────────────────────────────────"
echo "✅ Tous les secrets ont été configurés (26 variables)."
echo "   Vérification : gh secret list --repo $REPO"
