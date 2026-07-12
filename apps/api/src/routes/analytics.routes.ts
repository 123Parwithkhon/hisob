import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';

export const router: Router = Router();

router.use(authGuard);

router.get('/monthly-trend', AnalyticsController.getMonthlyTrend);
router.get('/categories/:type', AnalyticsController.getCategoryBreakdown);
router.get('/savings', AnalyticsController.getSavingsProgress);
router.get('/insights', AnalyticsController.getInsights);

export default router;