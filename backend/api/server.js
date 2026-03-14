import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import 'dotenv/config';

import * as BlockchainService from './services/blockchain.js';
import { transporter } from './services/email.js';
import scrutinRoutes from './routes/scrutins.js';
import voteRoutes from './routes/votes.js';
import moderatorRoutes from './routes/moderators.js';
import authRoutes from './routes/auth.js';
import requestVoteRoutes from './routes/request-votes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Anti-sleep mechanism (Self-ping every 10 minutes)
const pinger = () => {
    const url = process.env.RENDER_EXTERNAL_URL;
    if (url) {
        console.log(`[PINGER] Self-pinging ${url}/health...`);
        fetch(`${url}/health`)
            .then(res => res.json())
            .then(data => console.log(`[PINGER] Success: ${data.status}`))
            .catch(err => console.error(`[PINGER] Failed: ${err.message}`));
    }
};

if (process.env.NODE_ENV === 'production') {
    setInterval(pinger, 10 * 60 * 1000); // 10 minutes
}

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/scrutins', scrutinRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/moderators', moderatorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/request-vote', requestVoteRoutes);

// Static files (Frontend)
const buildPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(buildPath));

app.get('/health', async (req, res) => {
    const diagnostics = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: {
            NODE_ENV: process.env.NODE_ENV,
            HAS_RPC_URL: !!process.env.RPC_URL,
            HAS_PRIVATE_KEY: !!process.env.PRIVATE_KEY,
            HAS_FACTORY_ADDRESS: !!process.env.FACTORY_ADDRESS,
            EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL
        },
        blockchain: 'checking...',
        smtp: 'checking...'
    };

    // 1. Check Blockchain
    try {
        const net = await BlockchainService.provider.getNetwork().catch(() => null);
        diagnostics.blockchain = net ? { name: net.name, chainId: net.chainId.toString() } : 'disconnected';
    } catch (e) {
        diagnostics.blockchain = 'error: ' + e.message;
        console.error('[HEALTH] Blockchain check failed:', e);
    }

    // 2. Check SMTP (live connection test)
    try {
        const smtpTest = await new Promise((resolve) => {
            const timeout = setTimeout(() => resolve('timeout'), 10000);
            transporter.verify((error) => {
                clearTimeout(timeout);
                if (error) resolve('error: ' + error.message);
                else resolve('ready');
            });
        });
        diagnostics.smtp = smtpTest;
    } catch (e) {
        diagnostics.smtp = 'error: ' + e.message;
    }

    res.json(diagnostics);
});

// Catch-all for React Router
app.get('*path', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
