import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getReceipts, createReceipts, updateReceipts, deleteReceipts } from '../controllers/receipts.controller';

const router = Router();
router.use(requireAuth);
router.get('/', getReceipts);
router.post('/', createReceipts);
router.put('/:id', updateReceipts);
router.delete('/:id', deleteReceipts);

export default router;
