import type { Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

const categoryService = new CategoryService();

export class CategoryController {
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.listByUser(req.userId!);
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  static async listByType(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const type = String(req.params.type);
      const categories = await categoryService.listByType(
        req.userId!,
        type as 'INCOME' | 'EXPENSE'
      );
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.create(req.userId!, req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const category = await categoryService.update(req.userId!, id, req.body);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await categoryService.delete(req.userId!, id);
      res.json({ success: true, message: 'Категория удалена' });
    } catch (error) {
      next(error);
    }
  }
}