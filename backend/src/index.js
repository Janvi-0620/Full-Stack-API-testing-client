import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDb } from './config/db.js';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

import authRoutes from './routes/auth.js';
import collectionRoutes from './routes/collections.js';
import requestRoutes from './routes/requests.js';
import proxyRoutes from './routes/proxy.js';
import environmentRoutes from './routes/environments.js';
import historyRoutes from './routes/history.js';

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/proxy', proxyRoutes);
app.use('/api/environments', environmentRoutes);
app.use('/api/history', historyRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use(errorHandler);

const port = process.env.PORT || 4000;

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
