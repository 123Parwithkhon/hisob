import type { Response, NextFunction } from 'express';
import { GoalService } from '../services/goal.service.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

const goalService = new GoalService();

export class GoalController {
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const goals = await goalService.list(req.userId!);
      res.json({ success: true, data: goals });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const goal = await goalService.create(req.userId!, req.body);
      res.status(201).json({ success: true, data: goal });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const goal = await goalService.update(req.userId!, id, req.body);
      res.json({ success: true, data: goal });
    } catch (error) {
      next(error);
    }
  }

  static async contribute(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const goal = await goalService.contribute(req.userId!, id, req.body.amount);
      res.json({ success: true, data: goal });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await goalService.delete(req.userId!, id);
      res.json({ success: true, message: 'Цель удалена' });
    } catch (error) {
      next(error);
    }
  }
}