import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../utils/errors';
import { fireWebhook } from '../services/webhook.service';

const router = Router();

// Public: view a project (client portal). No auth — gated only by knowledge
// of the project's unguessable UUID, which acts as the share link.
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        files: { orderBy: { createdAt: 'desc' } },
        checklistItems: { orderBy: { createdAt: 'asc' } },
        messages: { orderBy: { createdAt: 'asc' } },
        payments: { orderBy: { createdAt: 'desc' } },
        tasks: { orderBy: { createdAt: 'asc' } },
        user: { select: { name: true, logoUrl: true, brandColor: true } },
      },
    });

    if (!project) throw new AppError(404, 'Project not found');

    res.json({
      id: project.id,
      name: project.name,
      description: project.description,
      clientName: project.clientName,
      clientEmail: project.clientEmail,
      status: project.status,
      freelancer: project.user,
      files: project.files,
      checklistItems: project.checklistItems,
      messages: project.messages,
      payments: project.payments,
      tasks: project.tasks,
    });
  } catch (err) {
    next(err);
  }
});

// Public: client approves or rejects a checklist item
router.put('/:id/checklist/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const itemId = req.params.itemId as string;
    const { status, approvedBy } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      throw new AppError(400, 'Status must be "approved" or "rejected"');
    }
    if (!approvedBy) throw new AppError(400, 'approvedBy is required');

    const item = await prisma.checklistItem.findFirst({
      where: { id: itemId, projectId },
      include: { project: true },
    });
    if (!item) throw new AppError(404, 'Checklist item not found');

    const updated = await prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        status,
        approvedBy,
        approvedAt: status === 'approved' ? new Date() : null,
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

// Public: client updates a task's status
router.put('/:id/tasks/:taskId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const taskId = req.params.taskId as string;
    const { status } = req.body;

    if (!['todo', 'doing', 'blocked', 'done'].includes(status)) {
      throw new AppError(400, 'Invalid status');
    }

    const task = await prisma.task.findFirst({ where: { id: taskId, projectId } });
    if (!task) throw new AppError(404, 'Task not found');

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        status,
        lastActionBy: 'client',
        ...(task.firstClientActionAt === null && { firstClientActionAt: new Date() }),
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Public: client leaves a message
router.post('/:id/messages', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const { content, userEmail } = req.body;

    if (!content) throw new AppError(400, 'Content is required');

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError(404, 'Project not found');

    const message = await prisma.message.create({
      data: {
        projectId,
        content,
        userEmail: userEmail || project.clientEmail,
      },
    });

    fireWebhook(project.userId, 'message_created', {
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

export default router;
