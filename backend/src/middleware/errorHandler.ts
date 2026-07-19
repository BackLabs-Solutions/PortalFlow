import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { PaymentRequiredError } from './limits';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof PaymentRequiredError) {
    res.status(err.statusCode).json({ error: err.message, upgrade_url: err.upgradeUrl });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
