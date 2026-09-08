import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';

export const analyticsRouter: Router = Router();

analyticsRouter.use(authGuard);

analyticsRouter.get('/expenses-by-category', AnalyticsController.getExpensesByCategory);
analyticsRouter.get('/insights', AnalyticsController.getInsights);
analyticsRouter.get('/monthly-trend', AnalyticsController.getMonthlyTrend);