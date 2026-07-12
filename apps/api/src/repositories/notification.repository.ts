import { prisma } from '../config/prisma.js';
import type { CreateReminderDto, UpdateReminderDto } from '../validators/notification.validator.js';

export class NotificationRepository {
  async findByUser(userId: string, unreadOnly: boolean = false) {
    return prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { read: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async delete(id: string) {
    return prisma.notification.delete({
      where: { id },
    });
  }

  async create(userId: string, title: string, message: string) {
    return prisma.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  }

  // Reminders
  async findRemindersByUser(userId: string) {
    return prisma.reminder.findMany({
      where: { userId },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findReminderById(userId: string, id: string) {
    return prisma.reminder.findFirst({
      where: { id, userId },
    });
  }

  async createReminder(userId: string, dto: CreateReminderDto) {
    return prisma.reminder.create({
      data: {
        userId,
        title: dto.title,
        message: dto.message,
        scheduledAt: dto.scheduledAt,
        repeat: dto.repeat.toUpperCase() as 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY',
      },
    });
  }

  async updateReminder(id: string, dto: UpdateReminderDto) {
    return prisma.reminder.update({
      where: { id },
      data: {
        ...dto,
        repeat: dto.repeat ? dto.repeat.toUpperCase() as 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' : undefined,
      },
    });
  }

  async deleteReminder(id: string) {
    return prisma.reminder.delete({
      where: { id },
    });
  }

  async findDueReminders() {
    const now = new Date();
    return prisma.reminder.findMany({
      where: {
        isActive: true,
        scheduledAt: { lte: now },
        OR: [
          { lastSentAt: null },
          { lastSentAt: { lt: now } },
        ],
      },
      include: { user: true },
    });
  }

  async updateLastSent(id: string, date: Date) {
    return prisma.reminder.update({
      where: { id },
      data: { lastSentAt: date },
    });
  }

  async updateNextScheduled(id: string, nextDate: Date) {
    return prisma.reminder.update({
      where: { id },
      data: { scheduledAt: nextDate },
    });
  }
}