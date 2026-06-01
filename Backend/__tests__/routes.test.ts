import request from 'supertest';
import express from 'express';
// Mock auth middleware for testing
jest.mock('../src/middleware/auth.middleware', () => ({
  requireAuth: (req: any, res: any, next: any) => next()
}));

import chatRoutes from '../src/routes/chat.routes';
import transactionsRoutes from '../src/routes/transactions.routes';
import receiptsRoutes from '../src/routes/receipts.routes';
import budgetsRoutes from '../src/routes/budgets.routes';
import dashboardRoutes from '../src/routes/dashboard.routes';

const app = express();
app.use(express.json());

app.use('/api/chat', chatRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/dashboard', dashboardRoutes);

describe('API Routes Execution Time', () => {
  const resources = ['chat', 'transactions', 'receipts', 'budgets', 'dashboard'];
  
  resources.forEach(res => {
    it(`should GET /api/${res} in < 100ms`, async () => {
      const start = performance.now();
      const response = await request(app).get(`/api/${res}`);
      const end = performance.now();
      const duration = end - start;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(100);
      console.log(`[Time] /api/${res} took ${duration.toFixed(2)}ms`);
    });
  });
});
