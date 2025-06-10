import { PaymentResult } from '../types';
import { fomoPayConfig } from '../../config/payment';
import { PrismaClient } from '@prisma/client';

export class FomoPayService {
  constructor(private prisma: PrismaClient) {}

  async createOrder(amount: number, currency: string, userId: string): Promise<PaymentResult> {
    try {
      const orderNo = `ORDER_${Date.now()}_${userId}`;
      
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

      await this.createTransaction(userId, amount, currency, orderNo, result.payment_id);

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

  private async createTransaction(userId: string, amount: number, currency: string, orderId: string, paymentId: string) {
    return this.prisma.transaction.create({
      data: {
        userId,
        amount,
        currency,
        status: 'pending',
        paymentMethod: 'fomo_pay',
        orderId,
        paymentId
      }
    });
  }

  async handlePaymentNotification(payload: any) {
    const { order_no, payment_id, status, amount } = payload;

    const transaction = await this.prisma.transaction.findFirst({
      where: { orderId: order_no, paymentId: payment_id }
    });

    if (!transaction) {
      throw new Error('未找到对应的交易记录');
    }

    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: status.toLowerCase() }
    });

    if (status.toLowerCase() === 'success') {
      await this.prisma.user.update({
        where: { id: transaction.userId },
        data: { balance: { increment: parseFloat(amount) } }
      });
    }
  }
}