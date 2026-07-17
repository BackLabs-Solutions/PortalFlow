import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import prisma from '../config/database';
import { AppError } from '../utils/errors';
import { fireWebhook } from '../services/webhook.service';

const router = Router();

router.post('/projects/:id/messages', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.user!.id },
    });
    if (!project) throw new AppError(404, 'Project not found');

    const { content, fileId, userEmail } = req.body;
    if (!content) throw new AppError(400, 'Content is required');

    const message = await prisma.message.create({
      data: {
        projectId: project.id,
        content,
        fileId: fileId || null,
        userEmail: userEmail || req.user!.email,
      },
    });

    fireWebhook(req.user!.id, 'message_created', {
      project_id: project.id,
      message_id: message.id,
      content: message.content,
      user_email: message.userEmail,
      created_at: message.createdAt,
      project_name: project.name,
    }).catch((err) => console.error('Webhook fire error:', err));

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
});

router.get('/projects/:id/messages', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.user!.id },
    });
    if (!project) throw new AppError(404, 'Project not found');

    const messages = await prisma.message.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (err) {
    next(err);
  }
});

export default router;
