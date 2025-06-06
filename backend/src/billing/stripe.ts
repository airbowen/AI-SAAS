import Stripe from 'stripe';
import { stripeConfig } from '../config/payment';
import { PaymentResult, PaymentStatus } from './types';

const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: stripeConfig.apiVersion
});

export async function createStripePayment(
  amount: number,
  currency: string,
  userId: string
): Promise<PaymentResult> {
  try {
    // 创建 Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe 使用最小货币单位
      currency: currency.toLowerCase(),
      metadata: {
        userId
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    return {
      success: true,
      orderId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || undefined
    };
  } catch (error) {
    console.error('创建 Stripe 支付失败:', error);
    return {
      success: false,
      error: '创建支付失败'
    };
  }
}

export async function handleStripeWebhook(event: Stripe.Event): Promise<PaymentStatus> {
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      return 'success';
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      return 'failed';
    }
    default:
      return 'pending';
  }
}