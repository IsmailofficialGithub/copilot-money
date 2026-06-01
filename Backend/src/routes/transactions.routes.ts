import { Router } from 'express';
import { getTransactions } from '../controllers/transactions.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getTransactions);

export default router;
