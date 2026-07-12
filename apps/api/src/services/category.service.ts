import { CategoryRepository } from '../repositories/category.repository.js';
import type { TransactionType } from '@prisma/client';
import type { CreateCategoryDto, UpdateCategoryDto } from '../validators/category.validator.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export class CategoryService {
  private categoryRepo: CategoryRepository;

  constructor() {
    this.categoryRepo = new CategoryRepository();
  }

  async listByUser(userId: string) {
    return this.categoryRepo.findByUser(userId);
  }

  async listByType(userId: string, type: TransactionType) {
    return this.categoryRepo.findByUserAndType(userId, type);
  }

  async create(userId: string, dto: CreateCategoryDto) {
    // Проверяем, нет ли уже такой категории
    const existing = await this.categoryRepo.findByUserAndType(userId, dto.type);
    const exists = existing.find((c) => c.name.toLowerCase() === dto.name.toLowerCase());
    if (exists) {
      throw new ValidationError('Категория с таким названием уже существует');
    }

    return this.categoryRepo.create(userId, dto);
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepo.findById(userId, id);
    if (!category) {
      throw new NotFoundError('Категория не найдена');
    }
    return this.categoryRepo.update(id, dto);
  }

  async delete(userId: string, id: string) {
    const category = await this.categoryRepo.findById(userId, id);
    if (!category) {
      throw new NotFoundError('Категория не найдена');
    }
    if (category.isDefault) {
      throw new ValidationError('Нельзя удалить стандартную категорию');
    }
    await this.categoryRepo.delete(id);
    return { success: true };
  }

  async createDefaultCategories(userId: string) {
    const defaultCategories: CreateCategoryDto[] = [
      // Категории расходов
      { name: 'Продукты', type: 'EXPENSE', icon: 'ShoppingBasket', color: '#ef4444' },
      { name: 'Транспорт', type: 'EXPENSE', icon: 'Car', color: '#f59e0b' },
      { name: 'Связь', type: 'EXPENSE', icon: 'Phone', color: '#3b82f6' },
      { name: 'Жильё', type: 'EXPENSE', icon: 'Home', color: '#8b5cf6' },
      { name: 'Одежда', type: 'EXPENSE', icon: 'Shirt', color: '#ec4899' },
      { name: 'Лекарства', type: 'EXPENSE', icon: 'Pill', color: '#10b981' },
      { name: 'Развлечения', type: 'EXPENSE', icon: 'Gamepad2', color: '#f97316' },
      { name: 'Перевод домой', type: 'EXPENSE', icon: 'Send', color: '#06b6d4' },
      { name: 'Другое', type: 'EXPENSE', icon: 'MoreHorizontal', color: '#6b7280' },
      // Категории доходов
      { name: 'Зарплата', type: 'INCOME', icon: 'Wallet', color: '#22c55e' },
      { name: 'Подработка', type: 'INCOME', icon: 'Briefcase', color: '#10b981' },
      { name: 'Перевод', type: 'INCOME', icon: 'ArrowDownLeft', color: '#3b82f6' },
      { name: 'Другое', type: 'INCOME', icon: 'MoreHorizontal', color: '#6b7280' },
    ];

    await this.categoryRepo.createMany(userId, defaultCategories);
  }
}