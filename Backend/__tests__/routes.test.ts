import request from 'supertest';
import express from 'express';

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

app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/transactions', transactionsRoutes);
app.use('/api/v1/receipts', receiptsRoutes);
app.use('/api/v1/budgets', budgetsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

describe('API Routes Execution Time & CRUD Operations', () => {
  const checkTime = (start: number, end: number, route: string, method: string) => {
    const duration = end - start;
    expect(duration).toBeLessThan(150); // Setting to 150ms to comfortably pass cold starts in CI
    console.log(`[Time] ${method} ${route} took ${duration.toFixed(2)}ms`);
  };

  const resources = ['transactions', 'receipts', 'budgets'];

  resources.forEach(res => {
    describe(`/api/v1/${res}`, () => {
      it('GET should resolve in < 150ms', async () => {
        const start = performance.now();
        const response = await request(app).get(`/api/v1/${res}`);
        checkTime(start, performance.now(), `/api/v1/${res}`, 'GET');
        expect(response.status).toBe(200);
      });
      it('POST should resolve in < 150ms', async () => {
        const start = performance.now();
        const response = await request(app).post(`/api/v1/${res}`).send({});
        checkTime(start, performance.now(), `/api/v1/${res}`, 'POST');
        expect(response.status).toBe(201);
      });
      it('PUT should resolve in < 150ms', async () => {
        const start = performance.now();
        const response = await request(app).put(`/api/v1/${res}/123`).send({});
        checkTime(start, performance.now(), `/api/v1/${res}/123`, 'PUT');
        expect(response.status).toBe(200);
      });
      it('DELETE should resolve in < 150ms', async () => {
        const start = performance.now();
        const response = await request(app).delete(`/api/v1/${res}/123`);
        checkTime(start, performance.now(), `/api/v1/${res}/123`, 'DELETE');
        expect(response.status).toBe(200);
      });
    });
  });

  describe('/api/v1/chat', () => {
    it('GET should resolve in < 150ms', async () => {
      const start = performance.now();
      const response = await request(app).get('/api/v1/chat');
      checkTime(start, performance.now(), '/api/v1/chat', 'GET');
      expect(response.status).toBe(200);
    });
    it('POST should resolve in < 150ms', async () => {
      const start = performance.now();
      const response = await request(app).post('/api/v1/chat').send({});
      checkTime(start, performance.now(), '/api/v1/chat', 'POST');
      expect(response.status).toBe(201);
    });
  });

  describe('/api/v1/dashboard', () => {
    it('GET should resolve in < 150ms', async () => {
      const start = performance.now();
      const response = await request(app).get('/api/v1/dashboard');
      checkTime(start, performance.now(), '/api/v1/dashboard', 'GET');
      expect(response.status).toBe(200);
    });
  });
});
