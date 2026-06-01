import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getReceipts, createReceipts, updateReceipts, deleteReceipts } from '../controllers/receipts.controller';
import { upload } from '../middleware/upload.middleware';

const router = Router();
router.use(requireAuth);
router.get('/', getReceipts);
// Apply upload middleware to the POST route for receipts/CSVs
router.post('/', upload.single('file'), createReceipts);
router.put('/:id', updateReceipts);
router.delete('/:id', deleteReceipts);

export default router;
