import { Router } from 'express';
import {
  recharge,
  checkBalance,
  getUsageHistory,
  handlePaymentNotify,
  handleStripeNotify
} from './controller';
import { authMiddleware } from '../auth/middleware';

const router = Router();

router.post('/recharge', authMiddleware, recharge);
router.post('/payment-notify/fomopay', handlePaymentNotify);
router.post('/payment-notify/stripe', handleStripeNotify);
router.get('/balance', authMiddleware, checkBalance);
router.get('/usage-history', authMiddleware, getUsageHistory);

export default router;