import type Stripe from 'stripe';

export type PaymentMethod = 'fomo_pay' | 'stripe';
export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface RechargeInput {
  amount: number;
  paymentMethod: PaymentMethod;
  currency?: string;
}

export interface FomoPayConfig {
  merchantId: string;
  merchantSecret: string;
  apiEndpoint: string;
}

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  apiVersion: Stripe.LatestApiVersion;
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  paymentUrl?: string;
  clientSecret?: string;  // Stripe 支付需要
  error?: string;
}

export interface UsageRecord {
  type: string;            // 使用类型（如 'audio_transcription'）
  duration: number;        // 使用时长（秒）
  cost: number;           // 费用
}