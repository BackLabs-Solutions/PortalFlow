import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import prisma from '../config/database';

const router = Router();

router.get('/task_completion', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user!.id },
      include: { tasks: true },
    });

    const report = projects
      .filter((p) => p.tasks.length > 0)
      .map((p) => ({
        project_id: p.id,
        project_name: p.name,
        completion_rate: Math.round((p.tasks.filter((t) => t.status === 'done').length / p.tasks.length) * 100) / 100,
      }));

    res.json(report);
  } catch (err) {
    next(err);
  }
});

router.get('/client_response_time', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user!.id },
      include: { tasks: { where: { firstClientActionAt: { not: null } } } },
    });

    const report = projects
      .filter((p) => p.tasks.length > 0)
      .map((p) => {
        const totalHours = p.tasks.reduce((sum, t) => {
          const diffMs = t.firstClientActionAt!.getTime() - t.createdAt.getTime();
          return sum + diffMs / (1000 * 60 * 60);
        }, 0);
        return {
          project_id: p.id,
          project_name: p.name,
          avg_response_time_hours: Math.round((totalHours / p.tasks.length) * 10) / 10,
        };
      });

    res.json(report);
  } catch (err) {
    next(err);
  }
});

router.get('/invoice_status', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { project: { userId: req.user!.id } },
    });

    let paid = 0;
    let unpaid = 0;
    let overdue = 0;

    for (const p of payments) {
      const amount = Number(p.amount);
      if (p.status === 'paid') paid += amount;
      else if (p.status === 'overdue') overdue += amount;
      else unpaid += amount;
    }

    res.json({ paid, unpaid, overdue });
  } catch (err) {
    next(err);
  }
});

export default router;
