# 🛡️ Secure Deployment Guide - Blockchain-Vote

This guide provides a step-by-step walkthrough for deploying the **Blockchain-Vote** (VoteChain) application to **Render** with maximum security and efficiency.

---

## 🏗️ 1. Infrastructure Preparation (Render)

### Creating the Instance
The project uses a `render.yaml` Blueprint. This is the most secure way to deploy as it pre-configures the environment and ensures all services are linked correctly.

1. **GitHub Connection**: Ensure your repository is private or has sensitive files (`.env`) properly gitignored (already configured in `.gitignore`).
2. **Blueprint Instance**: In Render, go to **Blueprints** -> **New Blueprint Instance**.
3. **Service Type**: It will detect a "Web Service" using the `node` environment.

---

## 🔐 2. Security & Secrets Management

**NEVER** commit your private keys or secrets to Git. Use Render's environment variables.

### A. Blockchain Relayer (Critical)
The backend acts as a relayer for blockchain transactions.
- **PRIVATE_KEY**: Use a dedicated "Relayer Wallet" with only the necessary amount of ETH/MATIC for gas. Do **not** use your primary development or owner wallet.
- **RPC_URL**: Use a private endpoint from providers like **Alchemy** or **Infura**. Avoid public RPCs as they are rate-limited and less secure.
- **FACTORY_ADDRESS**: Double-check that you are using the address of the `ScrutinFactory` deployed on the target network (e.g., Sepolia).

### B. OAuth Configuration (Google & Microsoft)
In production, your Redirect URIs must strictly match your Render URL.
- **Google Cloud Console**: Add `https://your-app-name.onrender.com/oauth-callback` to the "Authorized redirect URIs".
- **Microsoft Azure**: Add the same URL to the "Redirect URIs" in your App Registration.
- **Client IDs**: Copy these to your Render environment variables.

### C. Database Security (MongoDB Atlas)
If using MongoDB Atlas:
- **IP Access**: Whitelist `0.0.0.0/0` (required for Render's dynamic IPs) or use a static IP service if available on your Render plan.
- **Database User**: Create a user with "Read and Write" permissions limited only to the specific database used by the app.

---

## ⚡ 3. The Deployment Process

### Step 1: Configure Environment Variables
Fill in the following in the Render Dashboard (based on `.env.production.example`):

| Variable | Source / Description |
| :--- | :--- |
| `RPC_URL` | Your Alchemy/Infura URL |
| `PRIVATE_KEY` | Relayer Wallet Private Key (Start with `0x`) |
| `FACTORY_ADDRESS` | Deployed ScrutinFactory address |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `SMTP_PASS` | App-specific password (if using Gmail) |
| `RENDER_EXTERNAL_URL` | Your Render domain (e.g. `https://app.onrender.com`) |

### Step 2: The Build Script
The app uses a monolithic build script defined in `backend/package.json`:
```bash
"build": "cd ../frontend && npm install && npm run build && cd ../backend && npm install"
```
This ensures the frontend is compiled into a `dist/` folder which the backend then serves. Render will run this automatically.

### Step 3: Verify the Anti-Sleep Mechanism
In production, the backend will console log:
`[PINGER] Self-pinging https://your-app.onrender.com/health...`
Check your Render logs to confirm this is firing every 10 minutes.

---

## 🧪 4. Post-Deployment Checklist

1. [ ] **Health Check**: Open `https://your-app.onrender.com/health`. You should see `{"status":"ok"}`.
2. [ ] **OAuth Flow**: Try logging in with a Google/Microsoft account. Ensure the popup closes and redirects properly.
3. [ ] **Blockchain Transaction**: Create a test scrutin. Check the transaction on Etherscan/Polygonscan to ensure the relayer is working.
4. [ ] **React Router**: Refresh the page on a sub-route (e.g. `/voter`). If it returns a 404, the catch-all route in `server.js` is not active.

---

## 🆘 Troubleshooting

- **Deployment Fails at 'npm build'**: Ensure `frontend/` and `backend/` directories exist and are correctly referenced in the root.
- **Relayer Error (Insufficient Funds)**: Check if your relayer wallet has enough native token (e.g., Sepolia ETH) to pay for gas.
- **CORS Errors**: The app is configured with `cors()` allowed, but ensure your `RENDER_EXTERNAL_URL` doesn't have a trailing slash if used in specific CORS origins.

---
Built with ❤️ by Epitech Blockchain Club.
