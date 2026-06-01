const fs = require('fs');
const path = require('path');

const resources = ['chat', 'transactions', 'receipts', 'budgets', 'dashboard'];

resources.forEach(res => {
  // Controller
  const name = res.charAt(0).toUpperCase() + res.slice(1);
  const controllerContent = `import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

export const get${name} = asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: '${res} route' });
});
`;
  fs.writeFileSync(path.join('src', 'controllers', `${res}.controller.ts`), controllerContent);
  
  // Route
  const routeContent = `import { Router } from 'express';
import { get${name} } from '../controllers/${res}.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, get${name});

export default router;
`;
  fs.writeFileSync(path.join('src', 'routes', `${res}.routes.ts`), routeContent);
});

// Update index.ts to include routes
let indexTs = fs.readFileSync('src/index.ts', 'utf-8');
if (!indexTs.includes('app.use(\'/api/chat\', chatRoutes);')) {
  const routeImports = resources.map(res => `import ${res}Routes from './routes/${res}.routes';`).join('\n');
  const routeUses = resources.map(res => `app.use('/api/${res}', ${res}Routes);`).join('\n');

  indexTs = indexTs.replace('// Global Error Handler', `// Application Routes\n${routeUses}\n\n// Global Error Handler`);
  indexTs = indexTs.replace('dotenv.config();', `dotenv.config();\n${routeImports}`);
  fs.writeFileSync('src/index.ts', indexTs);
}

// Test file
const testContent = `import request from 'supertest';
import express from 'express';
// Mock auth middleware for testing
jest.mock('../src/middleware/auth.middleware', () => ({
  requireAuth: (req: any, res: any, next: any) => next()
}));

${resources.map(res => `import ${res}Routes from '../src/routes/${res}.routes';`).join('\n')}

const app = express();
app.use(express.json());

${resources.map(res => `app.use('/api/${res}', ${res}Routes);`).join('\n')}

describe('API Routes Execution Time', () => {
  const resources = [${resources.map(r => `'${r}'`).join(', ')}];
  
  resources.forEach(res => {
    it(\`should GET /api/\${res} in < 100ms\`, async () => {
      const start = performance.now();
      const response = await request(app).get(\`/api/\${res}\`);
      const end = performance.now();
      const duration = end - start;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(100);
      console.log(\`[Time] /api/\${res} took \${duration.toFixed(2)}ms\`);
    });
  });
});
`;
if(!fs.existsSync('__tests__')) fs.mkdirSync('__tests__');
fs.writeFileSync('__tests__/routes.test.ts', testContent);
