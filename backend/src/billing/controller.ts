import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RechargeInput, PaymentResult } from './types';
import { AuthRequest } from '../auth/middleware';
import { FomoPayService } from './services/FomoPayService';
import { createStripePayment, handleStripeWebhook } from './stripe';
import { SUPPORTED_CURRENCIES } from '../config/payment';

const prisma = new PrismaClient();
const fomoPayService = new FomoPayService(prisma);

export async function recharge(req: AuthRequest, res: Response) {
  try {
    const { amount, paymentMethod, currency = 'SGD' }: RechargeInput = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: '未认证的用户' });
    }

    if (!Object.keys(SUPPORTED_CURRENCIES).includes(currency) || 
        !SUPPORTED_CURRENCIES[currency as keyof typeof SUPPORTED_CURRENCIES]?.includes(paymentMethod)) {
      return res.status(400).json({ error: '该支付方式不支持所选货币' });
    }

    let paymentResult: PaymentResult;
    switch (paymentMethod) {
      case 'fomo_pay':
        paymentResult = await fomoPayService.createOrder(amount, currency, userId);
        break;
      case 'stripe':
        paymentResult = await createStripePayment(amount, currency, String(userId));
        break;
      default:
        return res.status(400).json({ error: '不支持的支付方式' });
    }

    res.json(paymentResult);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : '创建支付订单失败'
    });
  }
}

export async function handlePaymentNotify(req: Request, res: Response) {
  try {
    await fomoPayService.handlePaymentNotification(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('处理 FomoPay 支付通知失败:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '处理支付通知失败'
    });
  }
}