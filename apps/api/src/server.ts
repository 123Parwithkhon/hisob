import express from 'express';
import cors from 'cors';
import 'dotenv/config';
   import analyticsRoutes from './routes/analytics.routes.js';
import { prisma } from './config/prisma.js';
import { errorHandler } from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import categoryRoutes from './routes/category.routes.js';
   import notificationRoutes from './routes/notification.routes.js';
import workUnitRoutes from './routes/work-unit.routes.js';
import goalRoutes from './routes/goal.routes.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://hisob-web.vercel.app', // Твой основной домен Vercel
    'https://hisob-web-git-main-123parwithkhons-projects.vercel.app' // Резервный домен Vercel
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    message: '🏦 Hisob API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/db-test', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', message: 'Database connected successfully' });
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/work-units', workUnitRoutes);
   app.use('/api/analytics', analyticsRoutes);
   app.use('/api/goals', goalRoutes);
   app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 API сервер запущен на http://localhost:${PORT}`);
});