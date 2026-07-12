import type { Response, NextFunction } from 'express';
import { TransactionService } from '../services/transaction.service.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

const transactionService = new TransactionService();

export class TransactionController {
  static async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await transactionService.getDashboardStats(req.userId!);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transaction = await transactionService.create(req.userId!, req.body);
      res.status(201).json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const transaction = await transactionService.update(req.userId!, id, req.body);
      res.json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await transactionService.delete(req.userId!, id);
      res.json({ success: true, message: 'Транзакция удалена' });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { type, from, to, categoryId, search, page, limit } = req.query;
      const result = await transactionService.list(req.userId!, {
        type: type as 'INCOME' | 'EXPENSE' | undefined,
        from: from ? new Date(from as string) : undefined,
        to: to ? new Date(to as string) : undefined,
        categoryId: categoryId as string | undefined,
        search: search as string | undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
    // НОВЫЙ МЕТОД ↓
  static async quickInput(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transaction = await transactionService.quickInput(req.userId!, req.body.command);
      res.status(201).json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  }
}