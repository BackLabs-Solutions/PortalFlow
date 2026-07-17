import { Router, Request, Response, NextFunction } from 'express';
import { requireApiKey } from '../middleware/auth';
import prisma from '../config/database';
import { AppError } from '../utils/errors';

const VALID_EVENTS = ['project_created', 'item_approved', 'message_created'];

const router = Router();

router.post('/register', requireApiKey, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventType, webhookUrl } = req.body;

    if (!eventType || !VALID_EVENTS.includes(eventType)) {
      throw new AppError(400, `Invalid event_type. Must be one of: ${VALID_EVENTS.join(', ')}`);
    }
    if (!webhookUrl || typeof webhookUrl !== 'string') {
      throw new AppError(400, 'webhook_url is required');
    }

    const webhook = await prisma.webhook.create({
      data: {
        userId: req.user!.id,
        eventType,
        webhookUrl,
      },
    });

    res.status(201).json({
      webhook_id: webhook.id,
      event_type: webhook.eventType,
      status: 'active',
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireApiKey, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const webhook = await prisma.webhook.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!webhook) throw new AppError(404, 'Webhook not found');

    await prisma.webhook.delete({ where: { id } });
    res.json({ message: 'Webhook deleted' });
  } catch (err) {
    next(err);
  }
});

router.get('/', requireApiKey, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const webhooks = await prisma.webhook.findMany({
      where: { userId: req.user!.id },
    });

    res.json(webhooks.map((wh) => ({
      webhook_id: wh.id,
      event_type: wh.eventType,
      webhook_url: wh.webhookUrl,
      active: wh.active,
    })));
  } catch (err) {
    next(err);
  }
});

router.post('/test', requireApiKey, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { webhookId, eventType } = req.body;

    const sampleData: Record<string, unknown> = {
      project_created: {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Test Project',
        client_email: 'client@example.com',
        client_name: 'Test Client',
        description: 'This is a test webhook payload',
        created_at: new Date().toISOString(),
        project_url: 'https://portalflow.app/projects/test',
      },
      item_approved: {
        project_id: '00000000-0000-0000-0000-000000000000',
        item_id: '00000000-0000-0000-0000-000000000001',
        title: 'Test Deliverable',
        approved_by: 'Test Client',
        approved_at: new Date().toISOString(),
        project_name: 'Test Project',
        project_url: 'https://portalflow.app/projects/test',
      },
      message_created: {
        project_id: '00000000-0000-0000-0000-000000000000',
        message_id: '00000000-0000-0000-0000-000000000002',
        content: 'This is a test message',
        user_email: 'client@example.com',
        created_at: new Date().toISOString(),
        project_name: 'Test Project',
      },
    };

    if (webhookId) {
      const webhook = await prisma.webhook.findFirst({
        where: { id: webhookId as string, userId: req.user!.id },
      });
      if (!webhook) throw new AppError(404, 'Webhook not found');

      const payload = sampleData[webhook.eventType] || sampleData['project_created'];

      const response = await fetch(webhook.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      });

      res.json({ message: 'Test sent', status: response.status, sample_data: payload });
      return;
    }

    const type = (eventType as string) || 'project_created';
    res.json({ message: 'Sample data for event type', event_type: type, sample_data: sampleData[type] });
  } catch (err) {
    next(err);
  }
});

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

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

    res.status(201).json({
      id: project.id,
      name: project.name,
      client_email: project.clientEmail,
      client_name: project.clientName,
      project_url: `${backendUrl}/projects/${project.id}`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
