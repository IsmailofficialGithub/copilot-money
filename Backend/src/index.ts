import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/error.middleware';
import { generalLimiter } from './middleware/rateLimit.middleware';
import chatRoutes from './routes/chat.routes';
import transactionsRoutes from './routes/transactions.routes';
import receiptsRoutes from './routes/receipts.routes';
import budgetsRoutes from './routes/budgets.routes';
import dashboardRoutes from './routes/dashboard.routes';
import settingsRoutes from './routes/settings.routes';
import { csvWorker, csvQueue } from './services/queue.service';

const app = express();
const PORT = process.env.PORT || 3001;

// Parse comma-separated FRONTEND_URL env var into an array of allowed origins
const allowedOrigins: (string | RegExp)[] = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some((o) => (o instanceof RegExp ? o.test(origin) : o === origin))) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Apply general IP rate limiting to all requests
app.use(generalLimiter);

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Revonix Backend is running.' });
});

// Application Routes (Versioned)
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/transactions', transactionsRoutes);
app.use('/api/v1/receipts', receiptsRoutes);
app.use('/api/v1/budgets', budgetsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful Shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  await csvWorker.close();
  await csvQueue.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
