import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { PaymentRequiredError, TIER_LIMITS } from '../middleware/limits';
import prisma from '../config/database';
import { AppError } from '../utils/errors';

const router = Router();

router.get('/profile', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new AppError(404, 'User not found');
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      logoUrl: user.logoUrl,
      brandColor: user.brandColor,
      customDomain: user.customDomain,
      tier: user.tier,
    });
  } catch (err) {
    next(err);
  }
});

router.put('/profile', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, logoUrl, brandColor, customDomain } = req.body;

    const current = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!current) throw new AppError(404, 'User not found');

    if (current.tier === 'free' && (brandColor !== undefined || customDomain !== undefined)) {
      throw new PaymentRequiredError(
        'Custom brand color and domain require a Pro or Agency plan.',
        '/billing/checkout?tier=pro'
      );
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name !== undefined && { name }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(brandColor !== undefined && { brandColor }),
        ...(customDomain !== undefined && { customDomain }),
      },
    });
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      logoUrl: user.logoUrl,
      brandColor: user.brandColor,
      customDomain: user.customDomain,
      tier: user.tier,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/limits', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new AppError(404, 'User not found');

    const tier = user.tier || 'free';
    const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;
    const currentProjects = await prisma.project.count({
      where: { userId: req.user!.id, status: 'active' },
    });

    res.json({
      tier,
      maxProjects: limits.maxProjects === Infinity ? null : limits.maxProjects,
      currentProjects,
      canCreateMore: currentProjects < limits.maxProjects,
      message: tier === 'free' && currentProjects >= limits.maxProjects
        ? 'Upgrade to Pro for unlimited projects'
        : null,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/referral', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new AppError(404, 'User not found');
    res.json({
      referralCode: user.referralCode,
      referralCount: user.referralCount,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
