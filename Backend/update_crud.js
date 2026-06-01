const fs = require('fs');
const path = require('path');

const resources = ['chat', 'transactions', 'receipts', 'budgets', 'dashboard'];

resources.forEach(res => {
  const name = res.charAt(0).toUpperCase() + res.slice(1);
  
  // Controllers
  let controllerContent = `import { Request, Response } from 'express';\nimport asyncHandler from 'express-async-handler';\n\n`;
  
  if (res === 'dashboard') {
    controllerContent += `export const get${name} = asyncHandler(async (req: Request, res: Response) => {\n  res.json({ message: 'GET ${res} route' });\n});\n`;
  } else if (res === 'chat') {
    controllerContent += `export const get${name} = asyncHandler(async (req: Request, res: Response) => {\n  res.json({ message: 'GET ${res} route' });\n});\n`;
    controllerContent += `export const create${name} = asyncHandler(async (req: Request, res: Response) => {\n  res.status(201).json({ message: 'POST ${res} route' });\n});\n`;
  } else {
    controllerContent += `export const get${name} = asyncHandler(async (req: Request, res: Response) => {\n  res.json({ message: 'GET ${res} route' });\n});\n`;
    controllerContent += `export const create${name} = asyncHandler(async (req: Request, res: Response) => {\n  res.status(201).json({ message: 'POST ${res} route' });\n});\n`;
    controllerContent += `export const update${name} = asyncHandler(async (req: Request, res: Response) => {\n  res.json({ message: 'PUT ${res} route' });\n});\n`;
    controllerContent += `export const delete${name} = asyncHandler(async (req: Request, res: Response) => {\n  res.json({ message: 'DELETE ${res} route' });\n});\n`;
  }
  
  fs.writeFileSync(path.join('src', 'controllers', `${res}.controller.ts`), controllerContent);
  
  // Routes
  let routeContent = `import { Router } from 'express';\nimport { requireAuth } from '../middleware/auth.middleware';\n`;
  
  if (res === 'dashboard') {
    routeContent += `import { get${name} } from '../controllers/${res}.controller';\n\nconst router = Router();\nrouter.use(requireAuth);\nrouter.get('/', get${name});\n\nexport default router;\n`;
  } else if (res === 'chat') {
    routeContent += `import { get${name}, create${name} } from '../controllers/${res}.controller';\n\nconst router = Router();\nrouter.use(requireAuth);\nrouter.get('/', get${name});\nrouter.post('/', create${name});\n\nexport default router;\n`;
  } else {
    routeContent += `import { get${name}, create${name}, update${name}, delete${name} } from '../controllers/${res}.controller';\n\nconst router = Router();\nrouter.use(requireAuth);\nrouter.get('/', get${name});\nrouter.post('/', create${name});\nrouter.put('/:id', update${name});\nrouter.delete('/:id', delete${name});\n\nexport default router;\n`;
  }
  
  fs.writeFileSync(path.join('src', 'routes', `${res}.routes.ts`), routeContent);
});

// Tests
let testContent = `import request from 'supertest';
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

app.use('/api/chat', chatRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/dashboard', dashboardRoutes);

describe('API Routes Execution Time & CRUD Operations', () => {
  const checkTime = (start: number, end: number, route: string, method: string) => {
    const duration = end - start;
    expect(duration).toBeLessThan(150); // Setting to 150ms to comfortably pass cold starts in CI
    console.log(\`[Time] \${method} \${route} took \${duration.toFixed(2)}ms\`);
  };

  const resources = ['transactions', 'receipts', 'budgets'];

  resources.forEach(res => {
    describe(\`/api/\${res}\`, () => {
      it('GET should resolve in < 150ms', async () => {
        const start = performance.now();
        const response = await request(app).get(\`/api/\${res}\`);
        checkTime(start, performance.now(), \`/api/\${res}\`, 'GET');
        expect(response.status).toBe(200);
      });
      it('POST should resolve in < 150ms', async () => {
        const start = performance.now();
        const response = await request(app).post(\`/api/\${res}\`).send({});
        checkTime(start, performance.now(), \`/api/\${res}\`, 'POST');
        expect(response.status).toBe(201);
      });
      it('PUT should resolve in < 150ms', async () => {
        const start = performance.now();
        const response = await request(app).put(\`/api/\${res}/123\`).send({});
        checkTime(start, performance.now(), \`/api/\${res}/123\`, 'PUT');
        expect(response.status).toBe(200);
      });
      it('DELETE should resolve in < 150ms', async () => {
        const start = performance.now();
        const response = await request(app).delete(\`/api/\${res}/123\`);
        checkTime(start, performance.now(), \`/api/\${res}/123\`, 'DELETE');
        expect(response.status).toBe(200);
      });
    });
  });

  describe('/api/chat', () => {
    it('GET should resolve in < 150ms', async () => {
      const start = performance.now();
      const response = await request(app).get('/api/chat');
      checkTime(start, performance.now(), '/api/chat', 'GET');
      expect(response.status).toBe(200);
    });
    it('POST should resolve in < 150ms', async () => {
      const start = performance.now();
      const response = await request(app).post('/api/chat').send({});
      checkTime(start, performance.now(), '/api/chat', 'POST');
      expect(response.status).toBe(201);
    });
  });

  describe('/api/dashboard', () => {
    it('GET should resolve in < 150ms', async () => {
      const start = performance.now();
      const response = await request(app).get('/api/dashboard');
      checkTime(start, performance.now(), '/api/dashboard', 'GET');
      expect(response.status).toBe(200);
    });
  });
});
`;

fs.writeFileSync('__tests__/routes.test.ts', testContent);
