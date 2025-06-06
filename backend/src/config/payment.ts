import { FomoPayConfig, StripeConfig } from '../billing/types';
import type Stripe from 'stripe';

export const fomoPayConfig: FomoPayConfig = {
  merchantId: process.env.FOMO_PAY_MERCHANT_ID || '',
  merchantSecret: process.env.FOMO_PAY_MERCHANT_SECRET || '',
  apiEndpoint: process.env.FOMO_PAY_API_ENDPOINT || 'https://ipg.fomopay.net/api/v2'
};

export const stripeConfig: StripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion
};

export const SUPPORTED_CURRENCIES = {
  SGD: ['fomo_pay', 'stripe'],
  USD: ['stripe']
};

export const PAYMENT_METHODS = {
  fomo_pay: {
    name: 'FOMO Pay',
    currencies: ['SGD'],
    description: '支持 PayNow、GrabPay 等支付方式'
  },
  stripe: {
    name: 'Stripe',
    currencies: ['SGD', 'USD'],
    description: '支持信用卡支付'
  }
};