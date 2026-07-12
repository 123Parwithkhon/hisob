import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(50),
  type: z.enum(['INCOME', 'EXPENSE']),
  icon: z.string().max(50).optional(),
  color: z.string().max(20).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().max(20).optional(),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;