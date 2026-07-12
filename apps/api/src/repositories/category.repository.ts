import { prisma } from '../config/prisma.js';
import type { TransactionType } from '@prisma/client';
import type { CreateCategoryDto, UpdateCategoryDto } from '../validators/category.validator.js';

export class CategoryRepository {
  async findByUserAndType(userId: string, type: TransactionType) {
    return prisma.category.findMany({
      where: { userId, type },
      orderBy: { name: 'asc' },
    });
  }

  async findByUser(userId: string) {
    return prisma.category.findMany({
      where: { userId },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(userId: string, id: string) {
    return prisma.category.findFirst({
      where: { id, userId },
    });
  }

  async create(userId: string, dto: CreateCategoryDto) {
    return prisma.category.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        icon: dto.icon,
        color: dto.color,
      },
    });
  }

  async createDefault(userId: string, dto: CreateCategoryDto) {
    return prisma.category.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        icon: dto.icon,
        color: dto.color,
        isDefault: true,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    return prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }

  async createMany(userId: string, categories: CreateCategoryDto[]) {
    return prisma.category.createMany({
      data: categories.map((c) => ({
        userId,
        name: c.name,
        type: c.type,
        icon: c.icon,
        color: c.color,
        isDefault: true,
      })),
    });
  }
}