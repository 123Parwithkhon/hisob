import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../validators/auth.validator.js';

export const router: Router = Router();

// Публичные роуты (без авторизации)
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refreshTokens);

// Защищённые роуты (требуют авторизации)
router.post('/logout', authGuard, AuthController.logout);
router.post('/change-password', authGuard, validate(changePasswordSchema), AuthController.changePassword);
router.get('/me', authGuard, AuthController.getProfile);
router.patch('/profile', authGuard, validate(updateProfileSchema), AuthController.updateProfile);

export default router;