import { prisma } from '../config/prisma.js';
import type { CreateWorkUnitDto, UpdateWorkUnitDto } from '../validators/work-unit.validator.js';

export class WorkUnitRepository {
  async findByUser(userId: string) {
    return prisma.workUnit.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });
  }

  async findById(userId: string, id: string) {
    return prisma.workUnit.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });
  }

  async create(userId: string, dto: CreateWorkUnitDto) {
    return prisma.workUnit.create({
      data: {
        userId,
        name: dto.name,
      },
    });
  }

  async update(id: string, dto: UpdateWorkUnitDto) {
    return prisma.workUnit.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    return prisma.workUnit.delete({
      where: { id },
    });
  }

  async getStats(userId: string, workUnitId: string) {
    const transactions = await prisma.transaction.findMany({
      where: { userId, workUnitId },
      select: {
        amount: true,
        quantity: true,
        date: true,
      },
    });

    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalQuantity = transactions.reduce((sum, t) => sum + Number(t.quantity || 0), 0);
    const avgPerUnit = totalQuantity > 0 ? totalAmount / totalQuantity : 0;

    return {
      totalAmount,
      totalQuantity,
      avgPerUnit,
      transactionCount: transactions.length,
    };
  }
}