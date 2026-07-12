import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { quickInputSchema } from '../validators/quick-input.validator.js';
import { createTransactionSchema, updateTransactionSchema } from '../validators/transaction.validator.js';

export const router: Router = Router();

router.use(authGuard);

router.get('/dashboard', TransactionController.getDashboardStats);
router.get('/', TransactionController.list);
router.post('/quick', validate(quickInputSchema), TransactionController.quickInput);
router.post('/', validate(createTransactionSchema), TransactionController.create);
router.patch('/:id', validate(updateTransactionSchema), TransactionController.update);
router.delete('/:id', TransactionController.delete);
router.get('/by-date-range', TransactionController.getByDateRange);
router.get('/daily-summary', TransactionController.getDailySummary);

export default router;