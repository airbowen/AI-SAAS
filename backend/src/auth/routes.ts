import { Router } from 'express';
import { sendCode, verifyCode } from './controller';

const router = Router();

router.post('/send-code', sendCode);
router.post('/verify-code', verifyCode);

export default router;