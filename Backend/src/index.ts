import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { requireAuth } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();
import chatRoutes from './routes/chat.routes';
import transactionsRoutes from './routes/transactions.routes';
import receiptsRoutes from './routes/receipts.routes';
import budgetsRoutes from './routes/budgets.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Revonix Backend is running.' });
});

// Application Routes
app.use('/api/chat', chatRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
