import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  getSettings,
  updateSettings,
  exportSettings,
  deleteSettingsTransactions,
  deleteSettingsAccount,
} from '../controllers/settings.controller';

const router = Router();

// Apply auth middleware to all settings routes
router.use(requireAuth);

router.get('/', getSettings);
router.put('/', updateSettings);
router.get('/export', exportSettings);
router.delete('/transactions', deleteSettingsTransactions);
router.delete('/account', deleteSettingsAccount);

export default router;
