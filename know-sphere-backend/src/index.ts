import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

import { config } from './config/env';
import { connectDatabase } from './config/database';
import { VectorStoreService } from './vector/vector-store.service';
import setupSwagger from './config/swagger';

import authRoutes from './routes/auth.routes';
import documentRoutes from './routes/document.routes';
import chatRoutes from './routes/chat.routes';
import analyticsRoutes from './routes/analytics.routes';
import userRoutes from './routes/user.routes';
import settingsRoutes from './routes/settings.routes';

import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

const app = express();

// ── Security ─────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true }));

// ── Logging ───────────────────────────────────────────
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// ── Body parsing ──────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health check ──────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'KnowSphere API', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ── Swagger Docs ──────────────────────────────────────
setupSwagger(app);

// ── API Routes ────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);

// ── Error handling ────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Bootstrap ─────────────────────────────────────────
async function bootstrap(): Promise<void> {
  await connectDatabase();

  // Initialize Qdrant collection
  const vs = new VectorStoreService();
  await vs.ensureCollection();

  app.listen(config.port, () => {
    console.log(`🚀 KnowSphere API running on http://localhost:${config.port}`);
    console.log(`📄 Environment: ${config.nodeEnv}`);
    console.log(`🤖 AI Provider: ${config.ai.provider} / ${config.ai.model}`);
  });
}

bootstrap().catch(err => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});

export default app;
