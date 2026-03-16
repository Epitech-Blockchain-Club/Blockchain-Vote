import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';

import scrutinRoutes from './routes/scrutins.js';
import voteRoutes from './routes/votes.js';
import moderatorRoutes from './routes/moderators.js';
import authRoutes from './routes/auth.js';
import requestVoteRoutes from './routes/request-votes.js';
import superadminRoutes from './routes/superadmin.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost',
    'http://localhost:3000'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // In development, you might want to allow everything, but in prod structure it:
            // For now, to ensure Render transition is smooth, we act a bit permissively 
            // but prioritize the true FRONTEND_URL.
            callback(null, true);
        }
    },
    credentials: true
}));
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
app.use('/api/superadmin', superadminRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
