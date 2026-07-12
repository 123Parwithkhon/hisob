import { z } from 'zod';

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(100),
  description: z.string().max(500).optional(),
  target: z.number().positive('Цель должна быть больше 0'),
  deadline: z.coerce.date().optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  target: z.number().positive().optional(),
  deadline: z.coerce.date().optional().nullable(),
});

export const contributeGoalSchema = z.object({
  amount: z.number().positive('Сумма должна быть больше 0'),
});

export type CreateGoalDto = z.infer<typeof createGoalSchema>;
export type UpdateGoalDto = z.infer<typeof updateGoalSchema>;
export type ContributeGoalDto = z.infer<typeof contributeGoalSchema>;