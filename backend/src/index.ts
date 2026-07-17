import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import projectRoutes from './routes/projects';
import fileRoutes from './routes/files';
import checklistRoutes from './routes/checklist';
import messageRoutes from './routes/messages';
import webhookRoutes from './routes/webhooks';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
}));

app.get('/', (_req, res) => {
  res.json({ name: 'PortalFlow API', version: '1.0.0', docs: '/health' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use('/', fileRoutes);
app.use('/', checklistRoutes);
app.use('/', messageRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/api/zapier', webhookRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`PortalFlow API running on port ${PORT}`);
});

export default app;
