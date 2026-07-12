import type { Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

const authService = new AuthService();

export class AuthController {
  // Регистрация
  static async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Вход
  static async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Обновление токена
  static async refreshTokens(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshTokens(refreshToken);
      res.json({
        success: true,
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  // Выход
  static async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.logout(refreshToken);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Смена пароля
  static async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.changePassword(req.userId, req.body.oldPassword, req.body.newPassword);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Получение профиля
  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.userId!);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Обновление профиля
  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.updateProfile(req.userId!, req.body);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}