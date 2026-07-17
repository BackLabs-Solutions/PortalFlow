import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import prisma from '../config/database';
import { AppError } from '../utils/errors';
import { fireWebhook } from '../services/webhook.service';

const router = Router();

router.post('/projects/:id/checklist', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.user!.id },
    });
    if (!project) throw new AppError(404, 'Project not found');

    const { title, description } = req.body;
    if (!title) throw new AppError(400, 'Title is required');

    const item = await prisma.checklistItem.create({
      data: {
        projectId: project.id,
        title,
        description,
      },
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.get('/projects/:id/checklist', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.user!.id },
    });
    if (!project) throw new AppError(404, 'Project not found');

    const items = await prisma.checklistItem.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'asc' },
    });

    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.put('/checklist/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const item = await prisma.checklistItem.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!item || item.project.userId !== req.user!.id) {
      throw new AppError(404, 'Checklist item not found');
    }

    const { status, approvedBy, title, description } = req.body;

    const updated = await prisma.checklistItem.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(approvedBy !== undefined && { approvedBy }),
        ...(status === 'approved' && { approvedAt: new Date() }),
      },
    });

    if (status === 'approved') {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
      fireWebhook(item.project.userId, 'item_approved', {
        project_id: item.projectId,
        item_id: updated.id,
        title: updated.title,
        approved_by: updated.approvedBy,
        approved_at: updated.approvedAt,
        project_name: item.project.name,
        project_url: `${backendUrl}/projects/${item.projectId}`,
      }).catch((err) => console.error('Webhook fire error:', err));
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
