import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getBudgets, createBudgets, updateBudgets, deleteBudgets } from '../controllers/budgets.controller';

const router = Router();
router.use(requireAuth);
router.get('/', getBudgets);
router.post('/', createBudgets);
router.put('/:id', updateBudgets);
router.delete('/:id', deleteBudgets);

export default router;
