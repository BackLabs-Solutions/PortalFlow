import Stripe from 'stripe';
import prisma from '../config/database';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export const TIER_PRICE_IDS: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  agency: process.env.STRIPE_AGENCY_PRICE_ID,
};

export async function getOrCreateStripeCustomer(userId: string, email: string, name: string | null): Promise<string> {
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (existing?.stripeCustomerId) return existing.stripeCustomerId;

  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { user_id: userId },
  });

  await prisma.subscription.upsert({
    where: { userId },
    update: { stripeCustomerId: customer.id },
    create: { userId, stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function createCheckoutSession(userId: string, email: string, name: string | null, tier: 'pro' | 'agency') {
  const priceId = TIER_PRICE_IDS[tier];
  if (!priceId) throw new Error(`No Stripe price configured for tier "${tier}"`);

  const customerId = await getOrCreateStripeCustomer(userId, email, name);
  const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${dashboardUrl}/dashboard/settings?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${dashboardUrl}/dashboard/settings?checkout=cancelled`,
    metadata: { user_id: userId, tier },
    subscription_data: { metadata: { user_id: userId, tier } },
  });

  return session.url!;
}

export async function createBillingPortalSession(userId: string) {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  if (!subscription?.stripeCustomerId) {
    throw new Error('No billing account found for this user yet');
  }

  const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${dashboardUrl}/dashboard/settings`,
  });

  return session.url;
}

export async function cancelSubscriptionAtPeriodEnd(userId: string) {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  if (!subscription?.stripeSubscriptionId) {
    throw new Error('No active subscription to cancel');
  }

  const updated = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await prisma.subscription.update({
    where: { userId },
    data: {
      status: updated.status,
      cancelAt: updated.cancel_at ? new Date(updated.cancel_at * 1000) : null,
    },
  });
}
