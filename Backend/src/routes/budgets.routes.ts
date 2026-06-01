import { Router } from 'express';
import { getBudgets } from '../controllers/budgets.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getBudgets);

export default router;
