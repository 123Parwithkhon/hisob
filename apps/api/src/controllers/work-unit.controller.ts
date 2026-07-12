import type { Response, NextFunction } from 'express';
import { WorkUnitService } from '../services/work-unit.service.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

const workUnitService = new WorkUnitService();

export class WorkUnitController {
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workUnits = await workUnitService.list(req.userId!);
      res.json({ success: true, data: workUnits });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workUnit = await workUnitService.create(req.userId!, req.body);
      res.status(201).json({ success: true, data: workUnit });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const workUnit = await workUnitService.update(req.userId!, id, req.body);
      res.json({ success: true, data: workUnit });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await workUnitService.delete(req.userId!, id);
      res.json({ success: true, message: 'Единица работы удалена' });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const stats = await workUnitService.getStats(req.userId!, id);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}