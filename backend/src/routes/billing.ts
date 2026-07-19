import { Router, Request, Response, NextFunction } from 'express';
import type Stripe from 'stripe';
import prisma from '../config/database';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../utils/errors';
import {
  stripe,
  TIER_PRICE_IDS,
  createCheckoutSession,
  createBillingPortalSession,
  cancelSubscriptionAtPeriodEnd,
} from '../services/stripe.service';
import { syncSubscriptionFromStripe } from '../services/billingSync.service';

const router = Router();

router.post('/checkout', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tier } = req.body;
    if (tier !== 'pro' && tier !== 'agency') {
      throw new AppError(400, 'tier must be "pro" or "agency"');
    }
    if (!TIER_PRICE_IDS[tier]) {
      throw new AppError(500, `Billing is not configured for the "${tier}" tier yet`);
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new AppError(404, 'User not found');

    const checkoutUrl = await createCheckoutSession(user.id, user.email, user.name, tier);
    res.json({ checkout_url: checkoutUrl });
  } catch (err) {
    next(err);
  }
});

router.get('/checkout-success', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.query.session_id as string;
    if (!sessionId) throw new AppError(400, 'session_id is required');

    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });

    if (session.payment_status === 'paid' && session.subscription) {
      await syncSubscriptionFromStripe(session.subscription as Stripe.Subscription);
    }

    const subscription = await prisma.subscription.findUnique({ where: { userId: req.user!.id } });
    res.json({ message: `Welcome to ${subscription?.tier ?? 'your new plan'}!`, tier: subscription?.tier });
  } catch (err) {
    next(err);
  }
});

router.get('/subscription', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscription = await prisma.subscription.findUnique({ where: { userId: req.user!.id } });

    res.json({
      tier: subscription?.tier ?? 'free',
      status: subscription?.status ?? 'inactive',
      currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
      cancelAt: subscription?.cancelAt ?? null,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/cancel', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await cancelSubscriptionAtPeriodEnd(req.user!.id);
    res.json({ message: 'Subscription will be cancelled at the end of the current billing period' });
  } catch (err) {
    if (err instanceof Error && err.message.includes('No active subscription')) {
      return next(new AppError(400, err.message));
    }
    next(err);
  }
});

router.get('/portal', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const portalUrl = await createBillingPortalSession(req.user!.id);
    res.json({ portal_url: portalUrl });
  } catch (err) {
    if (err instanceof Error && err.message.includes('No billing account')) {
      return next(new AppError(400, err.message));
    }
    next(err);
  }
});

export default router;
