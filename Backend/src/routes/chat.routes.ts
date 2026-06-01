import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getChat, createChat } from '../controllers/chat.controller';
import { aiLimiter } from '../middleware/rateLimit.middleware';

const router = Router();
router.use(requireAuth);
router.get('/', getChat);
router.get('/conversations', getChat);
router.post('/', aiLimiter, createChat); // Applied strict AI rate limiter

export default router;
