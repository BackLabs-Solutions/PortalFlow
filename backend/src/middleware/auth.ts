import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import prisma from '../config/database';
import { AppError } from '../utils/errors';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Missing or invalid authorization header'));
  }

  try {
    const decoded = verifyToken(header.slice(7));
    req.user = { id: decoded.userId, email: decoded.email };
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}

export async function requireApiKey(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Missing API key'));
  }

  const apiKey = header.slice(7);

  try {
    const user = await prisma.user.findUnique({ where: { apiKey } });
    if (!user) {
      return next(new AppError(401, 'Invalid API key'));
    }
    req.user = { id: user.id, email: user.email };
    next();
  } catch {
    next(new AppError(500, 'Authentication error'));
  }
}
