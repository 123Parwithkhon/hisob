import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export class AnalyticsController {
  // Получить расходы по категориям
  static async getExpensesByCategory(req: Request, res: Response) {
    console.log('\n📊 [ANALYTICS] GET /expenses-by-category');
    const userId = (req as any).user?.id;
    console.log('[ANALYTICS] userId:', userId);

    if (!userId) {
      console.error('[ANALYTICS] ❌ User not authenticated');
      return res.status(401).json({ success: false, message: 'Не авторизован' });
    }

    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      console.log('[ANALYTICS] startDate:', startDate);

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

      console.log('[ANALYTICS] Raw expenses from DB:', expenses);
      console.log('[ANALYTICS] Count:', expenses.length);

      if (expenses.length === 0) {
        console.log('[ANALYTICS] ️ No expenses found for last month');
        return res.json({ success: true, data: [] });
      }

      const categoryIds = expenses.map((e) => e.categoryId);
      console.log('[ANALYTICS] Category IDs:', categoryIds);

      const categories = await prisma.category.findMany({
        where: {
          id: { in: categoryIds },
        },
      });

      console.log('[ANALYTICS] Categories found:', categories.length);

      const chartData = expenses.map((expense) => {
        const category = categories.find((c) => c.id === expense.categoryId);
        const data = {
          name: category?.name || 'Без категории',
          value: Number(expense._sum.amount) || 0,
          color: category?.color || '#8884d8',
        };
        console.log('[ANALYTICS] Mapped data:', data);
        return data;
      }).filter((item) => item.value > 0);

      console.log('[ANALYTICS] ✅ Final chartData:', chartData);
      res.json({ success: true, data: chartData });
    } catch (error) {
      console.error('[ANALYTICS] ❌ Error:', error);
      res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
  }

  // Получить аналитику (insights)
  static async getInsights(req: Request, res: Response) {
    console.log('\n📊 [ANALYTICS] GET /insights');
    const userId = (req as any).user?.id;
    console.log('[ANALYTICS] userId:', userId);

    if (!userId) {
      console.error('[ANALYTICS]  User not authenticated');
      return res.status(401).json({ success: false, message: 'Не авторизован' });
    }

    try {
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

      console.log('[ANALYTICS] Top expense category:', topExpenseCategory);

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

      console.log('[ANALYTICS] Top income category:', topIncomeCategory);

      const insights = {
        topExpenseCategory: topExpenseCategory.length > 0 ? topExpenseCategory[0] : null,
        topIncomeCategory: topIncomeCategory.length > 0 ? topIncomeCategory[0] : null,
      };

      console.log('[ANALYTICS] ✅ Final insights:', insights);
      res.json({ success: true, data: insights });
    } catch (error) {
      console.error('[ANALYTICS] ❌ Error:', error);
      res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
  }

  // Получить тренд за месяц
  static async getMonthlyTrend(req: Request, res: Response) {
    console.log('\n📊 [ANALYTICS] GET /monthly-trend');
    const userId = (req as any).user?.id;
    console.log('[ANALYTICS] userId:', userId);

    if (!userId) {
      console.error('[ANALYTICS]  User not authenticated');
      return res.status(401).json({ success: false, message: 'Не авторизован' });
    }

    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      console.log('[ANALYTICS] startDate (6 months ago):', startDate);

      const monthlyData: any[] = await prisma.$queryRaw`
  SELECT 
    DATE_FORMAT(date, '%Y-%m') as month,
    SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income,
    SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expense,
    (SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) - 
     SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END)) as balance
  FROM \`Transaction\`
  WHERE userId = ${userId} 
    AND date >= ${startDate}
  GROUP BY DATE_FORMAT(date, '%Y-%m')
  ORDER BY month ASC
`;

console.log('[ANALYTICS] Raw monthly data:', monthlyData);
console.log('[ANALYTICS] Count:', monthlyData.length);

      if (monthlyData.length === 0) {
        console.log('[ANALYTICS] ⚠️ No monthly data found');
        return res.json({ success: true, data: [] });
      }

      console.log('[ANALYTICS] ✅ Sending monthly data:', monthlyData);
      res.json({ success: true, data: monthlyData });
    } catch (error) {
      console.error('[ANALYTICS] ❌ Error:', error);
      res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
  }
}