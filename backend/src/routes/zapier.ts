import { Router, Request, Response, NextFunction } from 'express';
import { requireApiKey } from '../middleware/auth';
import prisma from '../config/database';
import { AppError } from '../utils/errors';

const router = Router();

function backendUrl() {
  return process.env.BACKEND_URL || 'http://localhost:3001';
}

// Auth check used by the Zapier app's authentication test step
router.get('/me', requireApiKey, async (req: Request, res: Response) => {
  res.json({ id: req.user!.id, email: req.user!.email });
});

// Polling trigger: New Project Created
router.get('/projects/recent', requireApiKey, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 25, 100);

    const projects = await prisma.project.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    res.json(
      projects.map((p) => ({
        id: p.id,
        name: p.name,
        client_email: p.clientEmail,
        client_name: p.clientName,
        description: p.description,
        created_at: p.createdAt,
        project_url: `${backendUrl()}/projects/${p.id}`,
      }))
    );
  } catch (err) {
    next(err);
  }
});

// Polling trigger: Client Approved Item
router.get('/checklist/approved', requireApiKey, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 25, 100);

    const items = await prisma.checklistItem.findMany({
      where: { status: 'approved', project: { userId: req.user!.id } },
      orderBy: { approvedAt: 'desc' },
      take: limit,
      include: { project: true },
    });

    res.json(
      items.map((item) => ({
        item_id: item.id,
        project_id: item.projectId,
        title: item.title,
        approved_by: item.approvedBy,
        approved_at: item.approvedAt,
        project_name: item.project.name,
        project_url: `${backendUrl()}/projects/${item.projectId}`,
      }))
    );
  } catch (err) {
    next(err);
  }
});

// Polling trigger: New Message
router.get('/messages/recent', requireApiKey, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 25, 100);

    const messages = await prisma.message.findMany({
      where: { project: { userId: req.user!.id } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { project: true },
    });

    res.json(
      messages.map((m) => ({
        message_id: m.id,
        project_id: m.projectId,
        content: m.content,
        user_email: m.userEmail,
        created_at: m.createdAt,
        project_name: m.project.name,
        project_url: `${backendUrl()}/projects/${m.projectId}`,
      }))
    );
  } catch (err) {
    next(err);
  }
});

// Action: Create Project
router.post('/create-project', requireApiKey, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, clientEmail, clientName } = req.body;
    if (!name) throw new AppError(400, 'Project name is required');

    const project = await prisma.project.create({
      data: {
        userId: req.user!.id,
        name,
        description,
        clientEmail,
        clientName,
      },
    });

    res.status(201).json({
      id: project.id,
      name: project.name,
      client_email: project.clientEmail,
      client_name: project.clientName,
      project_url: `${backendUrl()}/projects/${project.id}`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
