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
  try {
    const orderNo = `ORDER_${Date.now()}_${userId}`;
    
    // 发送请求到 FomoPay
    const response = await fetch(`${fomoPayConfig.apiEndpoint}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fomoPayConfig.merchantSecret}`
      },
      body: JSON.stringify({
        merchant_id: fomoPayConfig.merchantId,
        order_no: orderNo,
        amount: amount.toFixed(2),
        currency,
        payment_method: 'PAYNOW_ONLINE',
        description: `充值 ${amount} ${currency}`,
        success_url: `${process.env.APP_URL}/payment/success`,
        fail_url: `${process.env.APP_URL}/payment/fail`,
        notification_url: `${process.env.API_URL}/api/billing/payment-notify/fomopay`
      })
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      throw new Error(result.error || '创建支付订单失败');
    }

    // 在数据库中创建交易记录
    await prisma.transaction.create({
      data: {
        userId,
        amount,
        currency,
        status: 'pending',
        paymentMethod: 'fomo_pay',
        orderId: orderNo,
        paymentId: result.payment_id
      }
    });

    return {
      success: true,
      orderId: orderNo,
      paymentUrl: result.payment_url
    };
  } catch (error) {
    console.error('FomoPay 创建订单失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建支付订单失败'
    };
  }
}

// 处理 FomoPay 支付通知
export async function handlePaymentNotify(req: Request, res: Response) {
  try {
    const { order_no, payment_id, status, amount } = req.body;

    // 更新交易状态
    const transaction = await prisma.transaction.findFirst({
      where: {
        orderId: order_no,
        paymentId: payment_id
      }
    });

    if (!transaction) {
      throw new Error('未找到对应的交易记录');
    }

    // 更新交易状态
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: status.toLowerCase() }
    });

    // 如果支付成功，更新用户余额
    if (status.toLowerCase() === 'success') {
      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          balance: {
            increment: parseFloat(amount)
          }
        }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('处理 FomoPay 支付通知失败:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '处理支付通知失败'
    });
  }
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