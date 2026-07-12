import type { Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  static async getMonthlyTrend(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { months } = req.query;
      const data = await analyticsService.getMonthlyTrend(req.userId!, months ? Number(months) : 6);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryBreakdown(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { type } = req.params;
      const data = await analyticsService.getCategoryBreakdown(req.userId!, type as 'INCOME' | 'EXPENSE');
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getSavingsProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getSavingsProgress(req.userId!);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getInsights(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getInsights(req.userId!);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}