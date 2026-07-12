import { z } from 'zod';

export const quickInputSchema = z.object({
  command: z.string().min(1, 'Команда не может быть пустой').max(100),
});

export type QuickInputDto = z.infer<typeof quickInputSchema>;