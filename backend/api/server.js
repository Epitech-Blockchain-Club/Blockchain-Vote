import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';

import { connectDB } from './services/db.js';
import { storage }   from './services/storage.js';

import scrutinRoutes     from './routes/scrutins.js';
import voteRoutes        from './routes/votes.js';
import moderatorRoutes   from './routes/moderators.js';
import authRoutes        from './routes/auth.js';
import requestVoteRoutes       from './routes/request-votes.js';
import superadminRoutes         from './routes/superadmin.js';
import settingsRoutes           from './routes/settings.js';
import voterAdditionRoutes      from './routes/voter-addition-requests.js';

const app  = express();
const PORT = process.env.PORT || 3001;

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
app.use('/api/scrutins',     scrutinRoutes);
app.use('/api/votes',        voteRoutes);
app.use('/api/moderators',   moderatorRoutes);
app.use('/api/auth',         authRoutes);
app.use('/api/request-vote',            requestVoteRoutes);
app.use('/api/superadmin',              superadminRoutes);
app.use('/api/settings',               settingsRoutes);
app.use('/api/voter-addition-requests', voterAdditionRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start only after DB is ready
(async () => {
    await connectDB();
    await storage.seed();
    app.listen(PORT, () => {
        console.log(`Backend server running on http://localhost:${PORT}`);
    });
})();
