import Stripe from 'stripe';

const API_VERSION = '2026-04-22.dahlia' as const;

// Lazy initialization to prevent build failures when STRIPE_SECRET_KEY is not set
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    _stripe = new Stripe(key, {
      apiVersion: API_VERSION,
      typescript: true,
    });
  }
  return _stripe;
}

// Alias for backwards compatibility
export const stripe = {
  get billingPortal() {
    return getStripe().billingPortal;
  },
  get customers() {
    return getStripe().customers;
  },
  get prices() {
    return getStripe().prices;
  },
  get checkout() {
    return getStripe().checkout;
  },
  get subscriptions() {
    return getStripe().subscriptions;
  },
  get webhooks() {
    return getStripe().webhooks;
  },
};

export { API_VERSION };