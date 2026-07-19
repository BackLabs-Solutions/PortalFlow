import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import prisma from '../config/database';
import { AppError } from '../utils/errors';

const VALID_STATUSES = ['todo', 'doing', 'blocked', 'done'];

const router = Router();

router.post('/projects/:id/tasks', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const project = await prisma.project.findFirst({ where: { id: projectId, userId: req.user!.id } });
    if (!project) throw new AppError(404, 'Project not found');

    const { title, description, assignedTo, dueDate } = req.body;
    if (!title) throw new AppError(400, 'Title is required');

    const task = await prisma.task.create({
      data: {
        projectId: project.id,
        title,
        description,
        assignedTo,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

router.get('/projects/:id/tasks', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const project = await prisma.project.findFirst({ where: { id: projectId, userId: req.user!.id } });
    if (!project) throw new AppError(404, 'Project not found');

    const tasks = await prisma.task.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'asc' },
    });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

router.get('/projects/:id/tasks/summary', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const project = await prisma.project.findFirst({ where: { id: projectId, userId: req.user!.id } });
    if (!project) throw new AppError(404, 'Project not found');

    const counts = await prisma.task.groupBy({
      by: ['status'],
      where: { projectId: project.id },
      _count: true,
    });

    const summary = { todo: 0, doing: 0, blocked: 0, done: 0 };
    for (const row of counts) {
      if (row.status in summary) {
        summary[row.status as keyof typeof summary] = row._count;
      }
    }

    res.json(summary);
  } catch (err) {
    next(err);
  }
});

router.put('/tasks/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const task = await prisma.task.findUnique({ where: { id }, include: { project: true } });
    if (!task || task.project.userId !== req.user!.id) {
      throw new AppError(404, 'Task not found');
    }

    const { title, description, assignedTo, dueDate, status } = req.body;
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      throw new AppError(400, `status must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(status !== undefined && { status, lastActionBy: 'freelancer' }),
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
