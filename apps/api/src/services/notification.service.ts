import { NotificationRepository } from '../repositories/notification.repository.js';
import type { CreateReminderDto, UpdateReminderDto } from '../validators/notification.validator.js';
import { NotFoundError } from '../utils/errors.js';
import { addDays, addWeeks, addMonths } from 'date-fns';

export class NotificationService {
  private notificationRepo: NotificationRepository;

  constructor() {
    this.notificationRepo = new NotificationRepository();
  }

  async list(userId: string, unreadOnly: boolean = false) {
    return this.notificationRepo.findByUser(userId, unreadOnly);
  }

  async getUnreadCount(userId: string) {
    return this.notificationRepo.getUnreadCount(userId);
  }

  async markAsRead(userId: string, id: string) {
    const notification = await this.notificationRepo.findByUser(userId);
    const exists = notification.find((n) => n.id === id);
    if (!exists) throw new NotFoundError('Уведомление не найдено');
    return this.notificationRepo.markAsRead(id);
  }

  async markAllAsRead(userId: string) {
    return this.notificationRepo.markAllAsRead(userId);
  }

  async delete(userId: string, id: string) {
    const notification = await this.notificationRepo.findByUser(userId);
    const exists = notification.find((n) => n.id === id);
    if (!exists) throw new NotFoundError('Уведомление не найдено');
    await this.notificationRepo.delete(id);
    return { success: true };
  }

  async createNotification(userId: string, title: string, message: string) {
    return this.notificationRepo.create(userId, title, message);
  }

  // Reminders
  async listReminders(userId: string) {
    return this.notificationRepo.findRemindersByUser(userId);
  }

  async createReminder(userId: string, dto: CreateReminderDto) {
    return this.notificationRepo.createReminder(userId, dto);
  }

  async updateReminder(userId: string, id: string, dto: UpdateReminderDto) {
    const reminder = await this.notificationRepo.findReminderById(userId, id);
    if (!reminder) throw new NotFoundError('Напоминание не найдено');
    return this.notificationRepo.updateReminder(id, dto);
  }

  async deleteReminder(userId: string, id: string) {
    const reminder = await this.notificationRepo.findReminderById(userId, id);
    if (!reminder) throw new NotFoundError('Напоминание не найдено');
    await this.notificationRepo.deleteReminder(id);
    return { success: true };
  }

  // Обработка просроченных напоминаний
  async processDueReminders() {
    const dueReminders = await this.notificationRepo.findDueReminders();

    for (const reminder of dueReminders) {
      // Создаём уведомление
      await this.notificationRepo.create(
        reminder.userId,
        `Напоминание: ${reminder.title}`,
        reminder.message || 'Не забудь!'
      );

      // Обновляем lastSentAt
      await this.notificationRepo.updateLastSent(reminder.id, new Date());

      // Если есть повтор, вычисляем следующую дату
      if (reminder.repeat !== 'NONE') {
        const nextDate = this.calculateNextDate(reminder.scheduledAt, reminder.repeat);
        await this.notificationRepo.updateNextScheduled(reminder.id, nextDate);
      } else {
        // Если нет повтор, деактивируем
        await this.notificationRepo.updateReminder(reminder.id, { isActive: false });
      }
    }

    return { processed: dueReminders.length };
  }

  private calculateNextDate(currentDate: Date, repeat: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY') {
    switch (repeat) {
      case 'DAILY':
        return addDays(currentDate, 1);
      case 'WEEKLY':
        return addWeeks(currentDate, 1);
      case 'MONTHLY':
        return addMonths(currentDate, 1);
      default:
        return currentDate;
    }
  }
}