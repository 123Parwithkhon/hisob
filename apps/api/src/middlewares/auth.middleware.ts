import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authGuard = (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);

    // ✅ Используем JWT_SECRET (как в auth.service.ts)
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'hisob-super-secret-jwt-key-2026-change-in-production-12345'
    ) as { userId: string; email: string };

    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
};