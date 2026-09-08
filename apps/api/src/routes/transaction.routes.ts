import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

import { quickInputSchema } from '../validators/quick-input.validator.js';
import { createTransactionSchema, updateTransactionSchema } from '../validators/transaction.validator.js';

export const transactionRouter: Router = Router();

transactionRouter.use(authGuard);

transactionRouter.get('/dashboard', TransactionController.getDashboardStats);
transactionRouter.get('/', TransactionController.list);
transactionRouter.get('/by-date-range', TransactionController.getByDateRange);
transactionRouter.get('/daily-summary', TransactionController.getDailySummary);

transactionRouter.post('/', validate(createTransactionSchema), TransactionController.create);
transactionRouter.post('/quick', validate(quickInputSchema), TransactionController.quickInput);

transactionRouter.put('/:id', validate(updateTransactionSchema), TransactionController.update);
transactionRouter.patch('/:id', validate(updateTransactionSchema), TransactionController.update);

transactionRouter.delete('/:id', TransactionController.delete);

export default transactionRouter;