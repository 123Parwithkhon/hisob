import type { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('\n❌ ========================================');
  console.error('❌ ОШИБКА НА СЕРВЕРЕ:');
  console.error('❌ Маршрут:', req.method, req.path);
  console.error('❌ Название:', err.name);
  console.error('❌ Сообщение:', err.message);
  console.error('❌ Статус код:', err.statusCode || 500);

  if (err.stack) {
    console.error('❌ Stack trace:');
    console.error(err.stack);
  }

  console.error('❌ ========================================\n');

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Внутренняя ошибка сервера';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}