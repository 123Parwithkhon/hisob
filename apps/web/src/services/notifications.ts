import { api } from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  message?: string;
  scheduledAt: string;
  repeat: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  isActive: boolean;
  createdAt: string;
}

export async function fetchNotifications(unreadOnly: boolean = false): Promise<Notification[]> {
  const response = await api.get('/notifications', {
    params: { unreadOnly },
  });
  return response.data.data;
}

export async function fetchUnreadCount(): Promise<number> {
  const response = await api.get('/notifications/unread-count');
  return response.data.data.count;
}

export async function markAsRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await api.patch('/notifications/read-all');
}

export async function deleteNotification(id: string): Promise<void> {
  await api.delete(`/notifications/${id}`);
}

export async function fetchReminders(): Promise<Reminder[]> {
  const response = await api.get('/notifications/reminders');
  return response.data.data;
}

export async function createReminder(data: {
  title: string;
  message?: string;
  scheduledAt: string;
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly';
}): Promise<Reminder> {
  const response = await api.post('/notifications/reminders', data);
  return response.data.data;
}

export async function deleteReminder(id: string): Promise<void> {
  await api.delete(`/notifications/reminders/${id}`);
}