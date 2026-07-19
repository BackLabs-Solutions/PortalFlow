import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import prisma from '../config/database';
import { AppError } from '../utils/errors';

const VALID_STATUSES = ['pending', 'sent', 'overdue', 'paid'];

const router = Router();

router.post('/projects/:id/payments', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const project = await prisma.project.findFirst({ where: { id: projectId, userId: req.user!.id } });
    if (!project) throw new AppError(404, 'Project not found');

    const { description, amount, dueDate, status } = req.body;
    if (amount === undefined || Number.isNaN(Number(amount))) {
      throw new AppError(400, 'A numeric amount is required');
    }

    const payment = await prisma.payment.create({
      data: {
        projectId: project.id,
        description,
        amount,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status && VALID_STATUSES.includes(status) ? status : 'pending',
      },
    });

    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
});

router.get('/projects/:id/payments', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const project = await prisma.project.findFirst({ where: { id: projectId, userId: req.user!.id } });
    if (!project) throw new AppError(404, 'Project not found');

    const payments = await prisma.payment.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(payments);
  } catch (err) {
    next(err);
  }
});

router.put('/payments/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const payment = await prisma.payment.findUnique({ where: { id }, include: { project: true } });
    if (!payment || payment.project.userId !== req.user!.id) {
      throw new AppError(404, 'Payment not found');
    }

    const { description, amount, dueDate, status } = req.body;
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      throw new AppError(400, `status must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(status !== undefined && { status, paidAt: status === 'paid' ? new Date() : payment.paidAt }),
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
