import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import prisma from '../config/database';
import { AppError } from '../utils/errors';
import { fireWebhook } from '../services/webhook.service';

const router = Router();

router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, clientEmail, clientName } = req.body;
    if (!name) throw new AppError(400, 'Project name is required');

    const project = await prisma.project.create({
      data: {
        userId: req.user!.id,
        name,
        description,
        clientEmail: clientEmail,
        clientName: clientName,
      },
    });

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    fireWebhook(req.user!.id, 'project_created', {
      id: project.id,
      name: project.name,
      client_email: project.clientEmail,
      client_name: project.clientName,
      description: project.description,
      created_at: project.createdAt,
      project_url: `${backendUrl}/projects/${project.id}`,
    }).catch((err) => console.error('Webhook fire error:', err));

    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;
    const status = req.query.status as string | undefined;

    const where: Record<string, unknown> = { userId: req.user!.id };
    if (status) where.status = status;

    const projects = await prisma.project.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    res.json(projects);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const project = await prisma.project.findFirst({
      where: { id, userId: req.user!.id },
      include: {
        files: true,
        checklistItems: true,
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!project) throw new AppError(404, 'Project not found');
    res.json(project);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.project.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!existing) throw new AppError(404, 'Project not found');

    const { name, description, status } = req.body;
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
      },
    });

    res.json(project);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.project.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!existing) throw new AppError(404, 'Project not found');

    await prisma.project.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
