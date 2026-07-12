import { prisma } from '../config/prisma.js';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, eachMonthOfInterval } from 'date-fns';

export class AnalyticsService {
  async getMonthlyTrend(userId: string, months: number = 6) {
    const endDate = new Date();
    const startDate = subMonths(endDate, months - 1);

    const monthsList = eachMonthOfInterval({ start: startDate, end: endDate });

    const monthlyData = await Promise.all(
      monthsList.map(async (month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);

        const [income, expense] = await Promise.all([
          prisma.transaction.aggregate({
            where: {
              userId,
              type: 'INCOME',
              date: { gte: monthStart, lte: monthEnd },
            },
            _sum: { amount: true },
          }),
          prisma.transaction.aggregate({
            where: {
              userId,
              type: 'EXPENSE',
              date: { gte: monthStart, lte: monthEnd },
            },
            _sum: { amount: true },
          }),
        ]);

        return {
          month: monthStart.toLocaleString('ru', { month: 'short' }),
          income: Number(income._sum.amount || 0),
          expense: Number(expense._sum.amount || 0),
          balance: Number(income._sum.amount || 0) - Number(expense._sum.amount || 0),
        };
      })
    );

    return monthlyData;
  }

  async getCategoryBreakdown(userId: string, type: 'INCOME' | 'EXPENSE') {
    const transactions = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type },
      _sum: { amount: true },
      _count: true,
    });

    const categories = await prisma.category.findMany({
      where: {
        id: { in: transactions.map((t) => t.categoryId!).filter(Boolean) },
      },
    });

    return transactions
      .filter((t) => t.categoryId)
      .map((t) => {
        const category = categories.find((c) => c.id === t.categoryId);
        return {
          categoryId: t.categoryId,
          name: category?.name || 'Без категории',
          color: category?.color || '#6b7280',
          amount: Number(t._sum.amount || 0),
          count: t._count,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }

  async getSavingsProgress(userId: string) {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const [totalIncome, totalExpense] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: 'INCOME', date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE', date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      }),
    ]);

    const income = Number(totalIncome._sum.amount || 0);
    const expense = Number(totalExpense._sum.amount || 0);
    const saved = income - expense;
    const savingsRate = income > 0 ? (saved / income) * 100 : 0;

    return {
      income,
      expense,
      saved,
      savingsRate: Math.max(0, savingsRate),
    };
  }

  async getInsights(userId: string) {
    const monthStart = startOfMonth(new Date());
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
    const lastMonthEnd = endOfMonth(lastMonthStart);

    // Текущий месяц
    const [currentIncome, currentExpense] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: 'INCOME', date: { gte: monthStart } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE', date: { gte: monthStart } },
        _sum: { amount: true },
      }),
    ]);

    // Прошлый месяц
    const [lastIncome, lastExpense] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'INCOME',
          date: { gte: lastMonthStart, lte: lastMonthEnd },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          date: { gte: lastMonthStart, lte: lastMonthEnd },
        },
        _sum: { amount: true },
      }),
    ]);

    const currentInc = Number(currentIncome._sum.amount || 0);
    const currentExp = Number(currentExpense._sum.amount || 0);
    const lastInc = Number(lastIncome._sum.amount || 0);
    const lastExp = Number(lastExpense._sum.amount || 0);

    const incomeChange = lastInc > 0 ? ((currentInc - lastInc) / lastInc) * 100 : 0;
    const expenseChange = lastExp > 0 ? ((currentExp - lastExp) / lastExp) * 100 : 0;

    // Топ категория расходов
    const topExpenseCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type: 'EXPENSE', date: { gte: monthStart } },
      _sum: { amount: true },
    });

    const topCategory = topExpenseCategory.sort((a, b) => Number(b._sum.amount) - Number(a._sum.amount))[0];
    let topCategoryName = 'Не определена';
    if (topCategory?.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: topCategory.categoryId },
      });
      topCategoryName = category?.name || 'Не определена';
    }

    const insights = [];

    if (incomeChange > 5) {
      insights.push({
        type: 'positive',
        message: `Доход вырос на ${incomeChange.toFixed(0)}% по сравнению с прошлым месяцем`,
      });
    } else if (incomeChange < -5) {
      insights.push({
        type: 'warning',
        message: `Доход снизился на ${Math.abs(incomeChange).toFixed(0)}%`,
      });
    }

    if (expenseChange > 10) {
      insights.push({
        type: 'warning',
        message: `Расходы выросли на ${expenseChange.toFixed(0)}%`,
      });
    }

    if (topCategoryName !== 'Не определена') {
      insights.push({
        type: 'info',
        message: `Больше всего потрачено на: ${topCategoryName}`,
      });
    }

    const savingsRate = currentInc > 0 ? ((currentInc - currentExp) / currentInc) * 100 : 0;
    if (savingsRate > 20) {
      insights.push({
        type: 'positive',
        message: `Отлично! Удаётся сохранить ${savingsRate.toFixed(0)}% дохода`,
      });
    }

    return insights;
  }
}