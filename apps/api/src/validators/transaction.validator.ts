import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive('Сумма должна быть больше 0'),
  currency: z.string().default('PLN'),
  categoryId: z.string().cuid().optional(),
  date: z.coerce.date(),
  place: z.string().max(100).optional(),
  comment: z.string().max(300).optional(),
  workUnitId: z.string().cuid().optional(),
  quantity: z.number().positive().optional(),
  quickInput: z.boolean().optional(),
});

export const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  categoryId: z.string().cuid().optional().nullable(),
  date: z.coerce.date().optional(),
  place: z.string().max(100).optional(),
  comment: z.string().max(300).optional().nullable(),
  workUnitId: z.string().cuid().optional().nullable(),
  quantity: z.number().positive().optional().nullable(),
});

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionDto = z.infer<typeof updateTransactionSchema>;