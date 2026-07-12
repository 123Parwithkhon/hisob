import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Theme } from '@prisma/client';
import { CategoryService } from './category.service.js';
import { UserRepository } from '../repositories/user.repository.js';
import type { RegisterDto, LoginDto, ChangePasswordDto } from '../validators/auth.validator.js';
import { AppError, UnauthorizedError, ValidationError } from '../utils/errors.js';
import type { JwtPayload, TokenPair } from '../types/index.js';

export class AuthService {
  private userRepo: UserRepository;
  private categoryService: CategoryService;
  constructor() {
    this.userRepo = new UserRepository();
    this.categoryService = new CategoryService();
  }

  // Регистрация
  async register(dto: RegisterDto) {
    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser) {
      throw new ValidationError('Пользователь с таким email уже существует');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepo.create(dto, passwordHash);

    // Создаём дефолтные категории
    await this.categoryService.createDefaultCategories(user.id);

    const tokens = this.generateTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user,
      ...tokens,
    };
  }

  // Вход
  async login(dto: LoginDto) {
    // Ищем пользователя
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError('Неверный email или пароль');
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Неверный email или пароль');
    }

    // Генерируем токены
    const tokens = this.generateTokens(user.id, user.email);

    // Сохраняем refresh token
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    // Возвращаем данные без пароля
    const { passwordHash, ...userData } = user;
    return {
      user: userData,
      ...tokens,
    };
  }

  // Обновление токена через refresh
  async refreshTokens(refreshToken: string) {
    // Ищем refresh token в БД
    const storedToken = await this.userRepo.findRefreshToken(refreshToken);
    if (!storedToken) {
      throw new UnauthorizedError('Недействительный refresh token');
    }

    // Проверяем срок действия
    if (storedToken.expiresAt < new Date()) {
      await this.userRepo.deleteRefreshToken(refreshToken);
      throw new UnauthorizedError('Refresh token истёк');
    }

    // Генерируем новую пару токенов
    const tokens = this.generateTokens(storedToken.userId, storedToken.user.email);

    // Удаляем старый refresh token
    await this.userRepo.deleteRefreshToken(refreshToken);

    // Сохраняем новый
    await this.saveRefreshToken(storedToken.userId, tokens.refreshToken);

    return tokens;
  }

  // Выход
  async logout(refreshToken: string) {
    try {
      await this.userRepo.deleteRefreshToken(refreshToken);
    } catch (error) {
      // Токен мог быть уже удалён — это ок
    }
    return { message: 'Выход выполнен успешно' };
  }

  // Смена пароля
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo.findByEmail(
      (await this.userRepo.findById(userId))?.email || ''
    );

    if (!user) {
      throw new AppError('Пользователь не найден', 404);
    }

    // Проверяем старый пароль
    const isPasswordValid = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new ValidationError('Неверный старый пароль');
    }

    // Хешируем новый пароль
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    // Обновляем пароль
    await this.userRepo.updatePassword(userId, newPasswordHash);

    // Удаляем все refresh токены (принудительный logout на всех устройствах)
    await this.userRepo.deleteAllRefreshTokens(userId);

    return { message: 'Пароль изменён успешно' };
  }

  // Получение профиля
  async getProfile(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError('Пользователь не найден', 404);
    }
    return user;
  }

  // Обновление профиля
  async updateProfile(
  userId: string,
  data: { name?: string; phone?: string; timezone?: string; theme?: Theme }
    ) {
      return this.userRepo.updateProfile(userId, data);
    }

  // Генерация JWT токенов
  private generateTokens(userId: string, email: string): TokenPair {
    const accessToken = jwt.sign(
      { sub: userId, email } as JwtPayload,
      process.env.JWT_ACCESS_SECRET || 'secret',
      { expiresIn: '15m' } // Access token живёт 15 минут
    );

    const refreshToken = jwt.sign(
      { sub: userId, email } as JwtPayload,
      process.env.JWT_REFRESH_SECRET || 'secret',
      { expiresIn: '7d' } // Refresh token живёт 7 дней
    );

    return { accessToken, refreshToken };
  }

  // Сохранение refresh token в БД
  private async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней

    await this.userRepo.createRefreshToken(userId, token, expiresAt);
  }
}