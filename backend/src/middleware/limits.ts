import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../utils/errors';

export const TIER_LIMITS: Record<string, { maxProjects: number }> = {
  free: { maxProjects: 1 },
  pro: { maxProjects: Infinity },
  agency: { maxProjects: Infinity },
};

export class PaymentRequiredError extends AppError {
  constructor(message: string, public upgradeUrl: string) {
    super(402, message);
  }
}

export async function enforceProjectLimit(req: Request, _res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    const tier = user?.tier || 'free';
    const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;

    const currentProjects = await prisma.project.count({
      where: { userId: req.user!.id, status: 'active' },
    });

    if (currentProjects >= limits.maxProjects) {
      throw new PaymentRequiredError(
        `Free tier is limited to ${limits.maxProjects} active project. Upgrade to Pro for unlimited projects.`,
        '/billing/checkout?tier=pro'
      );
    }

    next();
  } catch (err) {
    next(err);
  }
}
