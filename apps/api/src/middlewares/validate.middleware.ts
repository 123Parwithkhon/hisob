import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      console.error('\n❌ [VALIDATE] Ошибка валидации:');
      console.error('❌ Маршрут:', req.method, req.path);
      console.error('❌ Тело запроса:', req.body);

      if (error && typeof error === 'object' && 'issues' in error) {
        const zodError = error as { issues: Array<{ path: (string | number)[]; message: string }> };
        console.error('❌ Ошибки Zod:');
        zodError.issues.forEach((issue) => {
          console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
        });

        return res.status(400).json({
          success: false,
          message: 'Ошибка валидации',
          errors: zodError.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      next(error);
    }
  };
}