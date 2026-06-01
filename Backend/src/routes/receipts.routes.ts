import { Router } from 'express';
import { getReceipts } from '../controllers/receipts.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getReceipts);

export default router;
