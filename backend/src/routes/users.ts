import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
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
