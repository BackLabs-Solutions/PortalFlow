import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth';
import prisma from '../config/database';
import { AppError } from '../utils/errors';
import { uploadFile, deleteFile, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '../services/storage.service';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new AppError(415, `File type not allowed: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Upload limit reached, try again later' },
});

router.post(
  '/projects/:id/files',
  requireAuth,
  uploadLimiter,
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError(413, `File exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`));
        }
        return next(new AppError(400, err.message));
      }
      if (err) return next(err);
      next();
    });
  },
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.params.id as string;
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId: req.user!.id },
      });
      if (!project) throw new AppError(404, 'Project not found');

      if (!req.file) throw new AppError(400, 'A file is required');

      const { url, key } = await uploadFile(project.id, req.file.originalname, req.file.mimetype, req.file.buffer);

      const file = await prisma.file.create({
        data: {
          projectId: project.id,
          name: req.file.originalname,
          url,
          storageKey: key,
          size: req.file.size,
          uploadedBy: (req.body.uploadedBy as string) || 'freelancer',
        },
      });

      res.status(201).json(file);
    } catch (err) {
      next(err);
    }
  }
);

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

    if (file.storageKey) {
      await deleteFile(file.storageKey);
    }

    await prisma.file.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
