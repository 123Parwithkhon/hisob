import { prisma } from '../config/prisma.js';
import type { CreateGoalDto, UpdateGoalDto } from '../validators/goal.validator.js';

export class GoalRepository {
  async findByUser(userId: string) {
    return prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(userId: string, id: string) {
    return prisma.goal.findFirst({
      where: { id, userId },
    });
  }

  async create(userId: string, dto: CreateGoalDto) {
    return prisma.goal.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        target: dto.target,
        deadline: dto.deadline,
      },
    });
  }

  async update(id: string, dto: UpdateGoalDto) {
    return prisma.goal.update({
      where: { id },
      data: dto,
    });
  }

  async updateCurrent(id: string, current: number) {
    return prisma.goal.update({
      where: { id },
      data: { current },
    });
  }

  async delete(id: string) {
    return prisma.goal.delete({
      where: { id },
    });
  }
}