import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export class AnalyticsController {
  // Получить расходы по категориям за последний месяц
  static async getExpensesByCategory(req: Request, res: Response) {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Не авторизован' });
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

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

    const categoryIds = expenses.map((e) => e.categoryId);
    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
    });

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

  // ✅ НОВЫЙ: Получить аналитику (insights)
  static async getInsights(req: Request, res: Response) {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Не авторизован' });
    }

    // Топ категории расходов
    const topExpenseCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 1,
    });

    // Топ категории доходов
    const topIncomeCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'INCOME',
        date: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 1,
    });

    // Средний дневной расход
    const dailyAverage = await prisma.$queryRaw`
      SELECT AVG(daily_amount) as avg_amount
      FROM (
        SELECT DATE(date) as date_day, SUM(amount) as daily_amount
        FROM Transaction
        WHERE userId = ${userId} 
          AND type = 'EXPENSE'
          AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(date)
      ) as daily_totals
    `;

    const insights = {
      topExpenseCategory: topExpenseCategory.length > 0 ? topExpenseCategory[0] : null,
      topIncomeCategory: topIncomeCategory.length > 0 ? topIncomeCategory[0] : null,
      dailyAverageExpense: dailyAverage[0]?.avg_amount ? Number(dailyAverage[0].avg_amount) : 0,
    };

    res.json({ success: true, data: insights });
  }

  // ✅ НОВЫЙ: Получить тренд за месяц (monthly trend)
  static async getMonthlyTrend(req: Request, res: Response) {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Не авторизован' });
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    const monthlyData = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expense,
        (SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) - 
         SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END)) as balance
      FROM Transaction
      WHERE userId = ${userId} 
        AND date >= ${startDate}
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month ASC
    `;

    res.json({ success: true, data: monthlyData });
  }
}