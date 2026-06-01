import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getTransactions, createTransactions, updateTransactions, deleteTransactions } from '../controllers/transactions.controller';

const router = Router();
router.use(requireAuth);
router.get('/', getTransactions);
router.post('/', createTransactions);
router.put('/:id', updateTransactions);
router.delete('/:id', deleteTransactions);

export default router;
