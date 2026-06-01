import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { getTransactions, createTransactions, updateTransactions, deleteTransactions, uploadTransactions } from '../controllers/transactions.controller';

const router = Router();
router.use(requireAuth);
router.get('/', getTransactions);
router.post('/', createTransactions);
router.post('/upload', upload.single('file'), uploadTransactions);
router.put('/:id', updateTransactions);
router.delete('/:id', deleteTransactions);

export default router;
