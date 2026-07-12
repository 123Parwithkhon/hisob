import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository.js';
import { CategoryService } from './category.service.js';
import { prisma } from '../config/prisma.js';
import type { RegisterDto, LoginDto } from '../validators/auth.validator.js';
import { ValidationError } from '../utils/errors.js';

export class AuthService {
  private userRepo: UserRepository;
  private categoryService: CategoryService;

  constructor() {
    this.userRepo = new UserRepository();
    this.categoryService = new CategoryService();
  }

  async register(dto: RegisterDto) {
    console.log('\n🔵 [AUTH] Начало регистрации...');
    console.log('🔵 [AUTH] Данные:', { email: dto.email, name: dto.name });

    try {
      // 1. Проверка существующего пользователя
      console.log('🔵 [AUTH] Шаг 1: Проверка email...');
      const existingUser = await this.userRepo.findByEmail(dto.email);
      if (existingUser) {
        throw new ValidationError('Пользователь с таким email уже существует');
      }

      // 2. Хеширование пароля
      console.log('🔵 [AUTH] Шаг 2: Хеширование пароля...');
      const passwordHash = await bcrypt.hash(dto.password, 10);
      console.log('✅ [AUTH] Пароль захеширован');

      // 3. Создание пользователя
      console.log('🔵 [AUTH] Шаг 3: Создание пользователя в БД...');
      const user = await this.userRepo.create(dto, passwordHash);
      console.log('✅ [AUTH] Пользователь создан:', user.id);

      // 4. Создание дефолтных категорий
      console.log('🔵 [AUTH] Шаг 4: Создание дефолтных категорий...');
      await this.categoryService.createDefaultCategories(user.id);
      console.log('✅ [AUTH] Категории созданы');

      // 5. Генерация токенов
      console.log('🔵 [AUTH] Шаг 5: Генерация токенов...');
      const tokens = this.generateTokens(user.id, user.email);
      console.log('✅ [AUTH] Токены сгенерированы');

      // 6. Сохранение refresh токена
      console.log('🔵 [AUTH] Шаг 6: Сохранение refresh токена...');
      await this.saveRefreshToken(user.id, tokens.refreshToken);
      console.log('✅ [AUTH] Refresh токен сохранён');

      console.log('🎉 [AUTH] Регистрация успешна!\n');

      return {
        user,
        ...tokens,
      };
    } catch (error) {
      console.error('\n❌ [AUTH] ОШИБКА РЕГИСТРАЦИИ:');
      console.error('❌ Тип ошибки:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('❌ Сообщение:', error instanceof Error ? error.message : String(error));
      console.error('❌ Stack:', error instanceof Error ? error.stack : 'N/A');
      throw error;
    }
  }

  async login(dto: LoginDto) {
    console.log('\n🔵 [AUTH] Начало входа...');

    try {
      const user = await this.userRepo.findByEmail(dto.email);
      if (!user) {
        throw new ValidationError('Неверный email или пароль');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new ValidationError('Неверный email или пароль');
      }

      const tokens = this.generateTokens(user.id, user.email);
      await this.saveRefreshToken(user.id, tokens.refreshToken);

      console.log('🎉 [AUTH] Вход успешен!\n');

      return {
        user,
        ...tokens,
      };
    } catch (error) {
      console.error('❌ [AUTH] Ошибка входа:', error);
      throw error;
    }
  }

  async refreshTokens(refreshToken: string) {
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || 'hisob-refresh-token-secret-key-2026-67890'
    ) as { userId: string };
    
    const user = await this.userRepo.findById(decoded.userId);
    if (!user) {
      throw new ValidationError('Пользователь не найден');
    }

    const tokens = this.generateTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new ValidationError('Пользователь не найден');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new ValidationError('Неверный старый пароль');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update(userId, { passwordHash });
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new ValidationError('Пользователь не найден');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string; timezone?: string; theme?: string; currency?: string }) {
    await this.userRepo.update(userId, data);
    return this.getProfile(userId);
  }

  private generateTokens(userId: string, email: string) {
    const accessToken = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'hisob-super-secret-jwt-key-2026-change-in-production-12345',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET || 'hisob-refresh-token-secret-key-2026-67890',
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }
}