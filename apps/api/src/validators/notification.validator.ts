import { z } from 'zod';

export const createReminderSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(100),
  message: z.string().max(500).optional(),
  scheduledAt: z.coerce.date(),
  repeat: z.enum(['none', 'daily', 'weekly', 'monthly']).default('none'),
});

export const updateReminderSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  message: z.string().max(500).optional().nullable(),
  scheduledAt: z.coerce.date().optional(),
  repeat: z.enum(['none', 'daily', 'weekly', 'monthly']).optional(),
  isActive: z.boolean().optional(),
});

export type CreateReminderDto = z.infer<typeof createReminderSchema>;
export type UpdateReminderDto = z.infer<typeof updateReminderSchema>;