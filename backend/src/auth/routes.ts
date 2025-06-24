import { Router, Request, Response } from 'express';
import { sendCode, verifyCode } from './controller';

const router = Router();

router.post('/send-code', (req: Request, res: Response) => sendCode(req, res));
router.post('/verify-code', (req: Request, res: Response) => verifyCode(req, res));

export default router;