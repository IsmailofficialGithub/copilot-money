import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getChat, createChat } from '../controllers/chat.controller';

const router = Router();
router.use(requireAuth);
router.get('/', getChat);
router.post('/', createChat);

export default router;
