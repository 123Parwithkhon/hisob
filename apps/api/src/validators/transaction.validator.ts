import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .pipe(z.number().positive('Сумма должна быть больше 0')),
  currency: z.string().default('PLN'),
  categoryId: z
    .union([z.string().cuid(), z.literal(''), z.null()])
    .transform((val) => (val === '' || val === null ? undefined : val))
    .optional(),
  date: z.coerce.date(),
  place: z
    .union([z.string().max(100), z.literal(''), z.null()])
    .transform((val) => (val === '' || val === null ? undefined : val))
    .optional(),
  comment: z
    .union([z.string().max(300), z.literal(''), z.null()])
    .transform((val) => (val === '' || val === null ? undefined : val))
    .optional(),
  workUnitId: z
    .union([z.string().cuid(), z.literal(''), z.null()])
    .transform((val) => (val === '' || val === null ? undefined : val))
    .optional(),
  quantity: z
    .union([z.number(), z.string(), z.null()])
    .transform((val) => {
      if (val === null || val === '') return undefined;
      return typeof val === 'string' ? parseFloat(val) : val;
    })
    .pipe(z.number().positive().optional()),
  quickInput: z.boolean().optional().default(false),
});

export const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  categoryId: z
    .union([z.string().cuid(), z.literal(''), z.null()])
    .transform((val) => (val === '' || val === null ? undefined : val))
    .optional()
    .nullable(),
  date: z.coerce.date().optional(),
  place: z.string().max(100).optional().nullable(),
  comment: z.string().max(300).optional().nullable(),
  workUnitId: z
    .union([z.string().cuid(), z.literal(''), z.null()])
    .transform((val) => (val === '' || val === null ? undefined : val))
    .optional()
    .nullable(),
  quantity: z.number().positive().optional().nullable(),
});

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionDto = z.infer<typeof updateTransactionSchema>;