import { Router, Request, Response, NextFunction } from 'express';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { sendMagicLink, verifyMagicLinkToken, generateApiKey } from '../services/auth.service';
import { requireAuth } from '../middleware/auth';
import prisma from '../config/database';
import { AppError } from '../utils/errors';

const router = Router();

router.post('/sendMagicLink', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new AppError(400, 'Valid email is required');
    }
    const result = await sendMagicLink(email.toLowerCase().trim());
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/verifyToken', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) throw new AppError(400, 'Token is required');
    const result = await verifyMagicLinkToken(token);
    res.json(result);
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return next(new AppError(401, 'This link has expired. Request a new one.'));
    }
    if (err instanceof JsonWebTokenError) {
      return next(new AppError(401, 'This link is invalid.'));
    }
    next(err);
  }
});

router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { subscription: true },
    });
    if (!user) throw new AppError(404, 'User not found');
    const { apiKey, subscription, ...profile } = user;
    res.json({
      ...profile,
      subscription: subscription
        ? { status: subscription.status, currentPeriodEnd: subscription.currentPeriodEnd }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/generate-api-key', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await generateApiKey(req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
