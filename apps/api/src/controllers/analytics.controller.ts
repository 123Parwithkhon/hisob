import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export class AnalyticsController {
  // Получить расходы по категориям за последний месяц
  static async getExpensesByCategory(req: Request, res: Response) {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Не авторизован' });
    }

    // Дата начала последнего месяца
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    // Группируем транзакции по категориям
    const expenses = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startDate },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    // Получаем информацию о категориях
    const categoryIds = expenses.map((e) => e.categoryId);
    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
    });

    // Формируем данные для графика
    const chartData = expenses.map((expense) => {
      const category = categories.find((c) => c.id === expense.categoryId);
      return {
        name: category?.name || 'Без категории',
        value: Number(expense._sum.amount) || 0,
        color: category?.color || '#8884d8',
      };
    }).filter((item) => item.value > 0);

    res.json({ success: true, data: chartData });
  }
}