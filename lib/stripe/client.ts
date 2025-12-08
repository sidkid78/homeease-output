
import Stripe from 'stripe';

/**
 * Initializes a new Stripe client.
 * Uses the Stripe secret key from environment variables.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
});

/**
 * Stripe publishable key for client-side operations.
 * This should be publicly accessible.
 */
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
