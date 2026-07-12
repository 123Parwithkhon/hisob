import { z } from 'zod';

export const createWorkUnitSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(50),
});

export const updateWorkUnitSchema = z.object({
  name: z.string().min(1).max(50).optional(),
});

export type CreateWorkUnitDto = z.infer<typeof createWorkUnitSchema>;
export type UpdateWorkUnitDto = z.infer<typeof updateWorkUnitSchema>;