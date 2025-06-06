import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RechargeInput, PaymentResult, FomoPayConfig } from './types';
import { AuthRequest } from '../auth/middleware';
import { createStripePayment, handleStripeWebhook } from './stripe';
import { SUPPORTED_CURRENCIES, stripeConfig } from '../config/payment';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const COST_PER_MINUTE = 0.1;  // 每分钟费用

const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: stripeConfig.apiVersion
});

// 创建 FomoPay 订单
async function createFomoPayOrder(amount: number, currency: string, userId: string): Promise<PaymentResult> {
  // TODO: 实现 FomoPay 支付逻辑
  throw new Error('FomoPay 支付功能尚未实现');
}

// 处理 FomoPay 支付通知
export async function handlePaymentNotify(req: Request, res: Response) {
  // TODO: 实现 FomoPay 支付通知处理逻辑
  res.status(501).json({ error: 'FomoPay 支付通知处理功能尚未实现' });
}

export async function recharge(req: AuthRequest, res: Response) {
  try {
    const { amount, paymentMethod, currency = 'SGD' }: RechargeInput = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: '未认证的用户' });
    }

    // 检查支付方式是否支持该货币
    if (!Object.keys(SUPPORTED_CURRENCIES).includes(currency) || 
        !SUPPORTED_CURRENCIES[currency as keyof typeof SUPPORTED_CURRENCIES]?.includes(paymentMethod)) {
      return res.status(400).json({ error: '该支付方式不支持所选货币' });
    }

    let paymentResult: PaymentResult;

    switch (paymentMethod) {
      case 'fomo_pay':
        paymentResult = await createFomoPayOrder(amount, currency, userId);
        break;
      case 'stripe':
        paymentResult = await createStripePayment(amount, currency, userId);
        break;
      default:
        return res.status(400).json({ error: '不支持的支付方式' });
    }

    if (!paymentResult.success) {
      return res.status(500).json({ error: paymentResult.error });
    }

    // 创建待支付订单记录
    await prisma.transaction.create({
      data: {
        userId,
        type: 'recharge_pending',
        amount,
        description: `充值 ${amount} ${currency}`,
        metadata: {
          orderId: paymentResult.orderId,
          paymentMethod,
          currency
        }
      }
    });

    res.json({
      message: '创建支付订单成功',
      paymentUrl: paymentResult.paymentUrl,
      clientSecret: paymentResult.clientSecret,
      orderId: paymentResult.orderId
    });
  } catch (error) {
    console.error('充值错误:', error);
    res.status(500).json({ error: '创建支付订单失败' });
  }
}

// 处理 Stripe Webhook
export async function handleStripeNotify(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: '缺少签名' });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      stripeConfig.webhookSecret
    );

    const status = await handleStripeWebhook(event);
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.id;

    // 查找待支付订单
    const transaction = await prisma.transaction.findFirst({
      where: {
        metadata: {
          path: ['orderId'],
          equals: orderId
        },
        type: 'recharge_pending'
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: '订单不存在' });
    }

    if (status === 'success') {
      await prisma.$transaction(async (prisma: PrismaClient) => {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { type: 'recharge' }
        });

        await prisma.user.update({
          where: { id: transaction.userId },
          data: {
            balance: { increment: transaction.amount }
          }
        });
      });
    } else if (status === 'failed') {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { type: 'recharge_failed' }
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error('处理 Stripe Webhook 错误:', error);
    res.status(400).json({ error: '无效的 Webhook' });
  }
}

export async function checkBalance(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: '未认证的用户' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        balance: true,
        quotaLimit: true,
        usedQuota: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      balance: user.balance,
      quotaLimit: user.quotaLimit,
      usedQuota: user.usedQuota,
      remainingQuota: user.quotaLimit - user.usedQuota
    });
  } catch (error) {
    console.error('查询余额错误:', error);
    res.status(500).json({ error: '查询失败' });
  }
}

export async function getUsageHistory(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: '未认证的用户' });
    }

    const usageLogs = await prisma.usageLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50  // 最近50条记录
    });

    res.json(usageLogs);
  } catch (error) {
    console.error('查询使用记录错误:', error);
    res.status(500).json({ error: '查询失败' });
  }
}