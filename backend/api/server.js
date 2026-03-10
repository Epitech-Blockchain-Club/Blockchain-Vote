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

const app = express();
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
app.use('/api/scrutins', scrutinRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/moderators', moderatorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/request-vote', requestVoteRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
