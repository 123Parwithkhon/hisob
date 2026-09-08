import { Router, Request, Response, NextFunction } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';

export const analyticsRouter: Router = Router();

// Временный middleware для проверки авторизации
// (заменим на правильный, когда узнаем название)
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Не авторизован' });
  }
  next();
};

analyticsRouter.use(requireAuth);
analyticsRouter.get('/expenses-by-category', AnalyticsController.getExpensesByCategory);