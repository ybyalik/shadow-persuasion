import Stripe from 'stripe';

/**
 * Lazily-initialized Stripe client.
 *
 * The real Stripe client is created on FIRST USE, not when this module is
 * imported. That way a missing STRIPE_SECRET_KEY can't crash the whole app or
 * the production build at startup — only code that actually calls Stripe (the
 * checkout/webhook routes) fails, and only when it runs. Every call site keeps
 * using `stripe.paymentIntents.create(...)` etc. unchanged.
 */

let client: Stripe | null = null;

function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    client = new Stripe(key, { apiVersion: '2026-03-25.dahlia' });
  }
  return client;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const real = getStripe();
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === 'function' ? value.bind(real) : value;
  },
});
