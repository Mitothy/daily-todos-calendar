import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHelpers.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('Error:', err.message);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal server error' });
}
