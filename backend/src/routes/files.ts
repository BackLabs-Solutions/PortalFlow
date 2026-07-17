import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import prisma from '../config/database';
import { AppError } from '../utils/errors';
import { v4 as uuid } from 'uuid';

const router = Router();

router.post('/projects/:id/files', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.user!.id },
    });
    if (!project) throw new AppError(404, 'Project not found');

    const { name, uploadedBy } = req.body;
    if (!name) throw new AppError(400, 'File name is required');

    const file = await prisma.file.create({
      data: {
        projectId: project.id,
        name,
        url: `https://storage.portalflow.app/${project.id}/${uuid()}/${name}`,
        size: req.body.size || 0,
        uploadedBy: uploadedBy || 'freelancer',
      },
    });

    res.status(201).json(file);
  } catch (err) {
    next(err);
  }
});

router.get('/projects/:id/files', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.user!.id },
    });
    if (!project) throw new AppError(404, 'Project not found');

    const files = await prisma.file.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(files);
  } catch (err) {
    next(err);
  }
});

router.delete('/files/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const file = await prisma.file.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!file || file.project.userId !== req.user!.id) {
      throw new AppError(404, 'File not found');
    }

    await prisma.file.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
