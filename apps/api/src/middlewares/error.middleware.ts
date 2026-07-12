import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // По умолчанию 500
  let statusCode = 500;
  let message = 'Internal server error';
  let issues = undefined;

  // Если это наша кастомная ошибка
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    issues = (err as any).issues;
  }

  // Если это ошибка валидации Zod
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation failed';
    issues = (err as any).errors;
  }

  // Логирование ошибок
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: err.message,
      statusCode,
      stack: err.stack,
    });
  }

  // Ответ клиенту
  res.status(statusCode).json({
    success: false,
    message,
    ...(issues && { issues }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};