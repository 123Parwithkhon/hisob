import type { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

const notificationService = new NotificationService();

export class NotificationController {
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { unreadOnly } = req.query;
      const notifications = await notificationService.list(
        req.userId!,
        unreadOnly === 'true'
      );
      res.json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const count = await notificationService.getUnreadCount(req.userId!);
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await notificationService.markAsRead(req.userId!, id);
      res.json({ success: true, message: 'Уведомление отмечено как прочитанное' });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.userId!);
      res.json({ success: true, message: 'Все уведомления отмечены как прочитанные' });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await notificationService.delete(req.userId!, id);
      res.json({ success: true, message: 'Уведомление удалено' });
    } catch (error) {
      next(error);
    }
  }

  // Reminders
  static async listReminders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reminders = await notificationService.listReminders(req.userId!);
      res.json({ success: true, data: reminders });
    } catch (error) {
      next(error);
    }
  }

  static async createReminder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reminder = await notificationService.createReminder(req.userId!, req.body);
      res.status(201).json({ success: true, data: reminder });
    } catch (error) {
      next(error);
    }
  }

  static async updateReminder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const reminder = await notificationService.updateReminder(req.userId!, id, req.body);
      res.json({ success: true, data: reminder });
    } catch (error) {
      next(error);
    }
  }

  static async deleteReminder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await notificationService.deleteReminder(req.userId!, id);
      res.json({ success: true, message: 'Напоминание удалено' });
    } catch (error) {
      next(error);
    }
  }
}