import Stripe from 'stripe';
import prisma from '../config/database';
import { TIER_PRICE_IDS } from './stripe.service';

function tierFromSubscription(subscription: Stripe.Subscription): string {
  const metaTier = subscription.metadata?.tier;
  if (metaTier === 'pro' || metaTier === 'agency') return metaTier;

  const priceId = subscription.items.data[0]?.price?.id;
  if (priceId && priceId === TIER_PRICE_IDS.pro) return 'pro';
  if (priceId && priceId === TIER_PRICE_IDS.agency) return 'agency';
  return 'free';
}

const ACTIVE_STATUSES = new Set(['active', 'trialing']);

export async function syncSubscriptionFromStripe(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  if (!userId) {
    console.error('Stripe subscription missing user_id metadata:', subscription.id);
    return;
  }

  const tier = ACTIVE_STATUSES.has(subscription.status) ? tierFromSubscription(subscription) : 'free';
  const item = subscription.items.data[0];

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      tier,
      status: subscription.status,
      currentPeriodStart: item ? new Date(item.current_period_start * 1000) : null,
      currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
      cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
    },
    create: {
      userId,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      tier,
      status: subscription.status,
      currentPeriodStart: item ? new Date(item.current_period_start * 1000) : null,
      currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
      cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
    },
  });

  await prisma.user.update({ where: { id: userId }, data: { tier } });
}

export async function markSubscriptionInactive(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  await prisma.subscription.update({
    where: { userId },
    data: { tier: 'free', status: 'inactive' },
  }).catch(() => undefined);

  await prisma.user.update({ where: { id: userId }, data: { tier: 'free' } }).catch(() => undefined);
}
