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
import zapierRoutes from './routes/zapier';
import portalRoutes from './routes/portal';
import billingRoutes from './routes/billing';
import stripeWebhookRoutes from './routes/stripeWebhook';
import taskRoutes from './routes/tasks';
import paymentRoutes from './routes/payments';
import reportRoutes from './routes/reports';
import openapiSpec from './openapi.json';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Render sits behind a single reverse proxy; trust its X-Forwarded-For
// header so express-rate-limit can correctly identify client IPs.
app.set('trust proxy', 1);

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
  credentials: true,
}));

// Stripe webhook needs the raw body for signature verification — must be
// registered before the global JSON body parser below.
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookRoutes);

app.use(express.json({ limit: '10mb' }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
}));

app.get('/', (_req, res) => {
  res.json({ name: 'PortalFlow API', version: '1.0.0', health: '/health', openapi: '/openapi.json' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/openapi.json', (_req, res) => {
  res.json(openapiSpec);
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use('/', fileRoutes);
app.use('/', checklistRoutes);
app.use('/', messageRoutes);
app.use('/', taskRoutes);
app.use('/', paymentRoutes);
app.use('/reports', reportRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/api/zapier', zapierRoutes);
app.use('/portal', portalRoutes);
app.use('/billing', billingRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`PortalFlow API running on port ${PORT}`);
});

export default app;
