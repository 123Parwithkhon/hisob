import { prisma } from '../config/prisma.js';
import type { TransactionType } from '@prisma/client';
import type { CreateTransactionDto, UpdateTransactionDto } from '../validators/transaction.validator.js';

export class TransactionRepository {
  async getStatsByPeriod(userId: string, type: TransactionType, from: Date, to: Date) {
    const result = await prisma.transaction.aggregate({
      where: { userId, type, date: { gte: from, lte: to } },
      _sum: { amount: true },
      _count: true,
    });
    return { total: Number(result._sum.amount || 0), count: result._count };
  }

  async getRecentTransactions(userId: string, limit: number = 10) {
    return prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
      include: { category: true },
    });
  }

  async getBalance(userId: string) {
    const [totalIncome, totalExpense] = await Promise.all([
      prisma.transaction.aggregate({ where: { userId, type: 'INCOME' }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { userId, type: 'EXPENSE' }, _sum: { amount: true } }),
    ]);
    return {
      income: Number(totalIncome._sum.amount || 0),
      expense: Number(totalExpense._sum.amount || 0),
      balance: Number(totalIncome._sum.amount || 0) - Number(totalExpense._sum.amount || 0),
    };
  }

  async create(userId: string, dto: CreateTransactionDto) {
    return prisma.transaction.create({
      data: {
        userId,
        type: dto.type,
        amount: dto.amount,
        currency: dto.currency,
        categoryId: dto.categoryId,
        date: dto.date,
        place: dto.place,
        comment: dto.comment,
        workUnitId: dto.workUnitId,
        quantity: dto.quantity,
      },
      include: { category: true },
    });
  }

  async findById(userId: string, id: string) {
    return prisma.transaction.findFirst({
      where: { id, userId },
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdateTransactionDto) {
    return prisma.transaction.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async delete(id: string) {
    return prisma.transaction.delete({ where: { id } });
  }

  async listByUser(
    userId: string,
    filters: {
      type?: TransactionType;
      from?: Date;
      to?: Date;
      categoryId?: string;
      search?: string;
      skip?: number;
      take?: number;
    }
  ) {
    return prisma.transaction.findMany({
      where: {
        userId,
        ...(filters.type && { type: filters.type }),
        ...(filters.from || filters.to
          ? {
              date: {
                ...(filters.from && { gte: filters.from }),
                ...(filters.to && { lte: filters.to }),
              },
            }
          : {}),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.search && {
          OR: [
            { comment: { contains: filters.search } },
            { place: { contains: filters.search } },
          ],
        }),
      },
      orderBy: { date: 'desc' },
      skip: filters.skip,
      take: filters.take,
      include: { category: true },
    });
  }
}