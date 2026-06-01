import { Router } from 'express';
import { getChat } from '../controllers/chat.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getChat);

export default router;
