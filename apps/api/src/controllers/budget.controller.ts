import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { ValidationError } from '../utils/errors.js';

export class BudgetController {
  static async getUserBudgets(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      throw new ValidationError('Пользователь не авторизован');
    }

    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: budgets });
  }

  static async createBudget(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      throw new ValidationError('Пользователь не авторизован');
    }

    const { categoryId, amount, period } = req.body;

    if (!categoryId || !amount || !period) {
      throw new ValidationError('Заполните все обязательные поля (categoryId, amount, period)');
    }

    const budget = await prisma.budget.create({
      data: {
        userId,
        categoryId,
        amount: parseFloat(amount),
        period,
        startDate: new Date(),
      },
      include: { category: true },
    });

    res.status(201).json({ success: true, data: budget });
  }

  static async checkBudgetStatus(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      throw new ValidationError('Пользователь не авторизован');
    }

    const { categoryId, period = 'MONTH' } = req.query;

    const startDate = new Date();
    if (period === 'WEEK') {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        period: period as string,
        ...(categoryId ? { categoryId: categoryId as string } : {}),
      },
      include: { category: true },
    });

    const budgetsWithStatus = await Promise.all(
      budgets.map(async (budget) => {
        const transactions = await prisma.transaction.findMany({
          where: {
            userId,
            categoryId: budget.categoryId,
            type: 'EXPENSE',
            date: { gte: startDate },
          },
          select: { amount: true },
        });

        const spent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

        return {
          ...budget,
          spent,
          remaining: budget.amount - spent,
          percentage: Math.round(percentage),
          isExceeded: spent > budget.amount,
          isWarning: percentage > 80 && percentage <= 100,
        };
      })
    );

    res.json({ success: true, data: budgetsWithStatus });
  }
}