import { GoalRepository } from '../repositories/goal.repository.js';
import { prisma } from '../config/prisma.js';
import type { CreateGoalDto, UpdateGoalDto } from '../validators/goal.validator.js';
import { NotFoundError } from '../utils/errors.js';
import { startOfMonth, subMonths, eachDayOfInterval, addDays } from 'date-fns';

export class GoalService {
  private goalRepo: GoalRepository;

  constructor() {
    this.goalRepo = new GoalRepository();
  }

  async list(userId: string) {
    const goals = await this.goalRepo.findByUser(userId);

    // Для каждой цели считаем прогноз
    const goalsWithForecast = await Promise.all(
      goals.map(async (goal) => {
        const remaining = Number(goal.target) - Number(goal.current);
        const progress = Number(goal.target) > 0
          ? (Number(goal.current) / Number(goal.target)) * 100
          : 0;

        const forecast = await this.calculateForecast(userId, remaining);

        return {
          ...goal,
          target: Number(goal.target),
          current: Number(goal.current),
          remaining,
          progress: Math.min(100, Math.max(0, progress)),
          forecast,
        };
      })
    );

    return goalsWithForecast;
  }

  async create(userId: string, dto: CreateGoalDto) {
    const goal = await this.goalRepo.create(userId, dto);
    return {
      ...goal,
      target: Number(goal.target),
      current: Number(goal.current),
      remaining: Number(goal.target),
      progress: 0,
      forecast: await this.calculateForecast(userId, Number(goal.target)),
    };
  }

  async update(userId: string, id: string, dto: UpdateGoalDto) {
    const goal = await this.goalRepo.findById(userId, id);
    if (!goal) throw new NotFoundError('Цель не найдена');

    const updated = await this.goalRepo.update(id, dto);
    const remaining = Number(updated.target) - Number(updated.current);

    return {
      ...updated,
      target: Number(updated.target),
      current: Number(updated.current),
      remaining,
      progress: Number(updated.target) > 0
        ? Math.min(100, (Number(updated.current) / Number(updated.target)) * 100)
        : 0,
      forecast: await this.calculateForecast(userId, remaining),
    };
  }

  async contribute(userId: string, id: string, amount: number) {
    const goal = await this.goalRepo.findById(userId, id);
    if (!goal) throw new NotFoundError('Цель не найдена');

    const newCurrent = Number(goal.current) + amount;
    await this.goalRepo.updateCurrent(id, newCurrent);

    const remaining = Number(goal.target) - newCurrent;
    const progress = Number(goal.target) > 0
      ? Math.min(100, (newCurrent / Number(goal.target)) * 100)
      : 0;

    return {
      ...goal,
      current: newCurrent,
      target: Number(goal.target),
      remaining,
      progress,
      forecast: await this.calculateForecast(userId, remaining),
    };
  }

  async delete(userId: string, id: string) {
    const goal = await this.goalRepo.findById(userId, id);
    if (!goal) throw new NotFoundError('Цель не найдена');
    await this.goalRepo.delete(id);
    return { success: true };
  }

  // Расчёт прогноза достижения
  private async calculateForecast(userId: string, remaining: number) {
    if (remaining <= 0) {
      return { daysLeft: 0, achievable: true, message: 'Цель достигнута!' };
    }

    // Считаем средний месячный "свободный" доход за последние 3 месяца
    const threeMonthsAgo = startOfMonth(subMonths(new Date(), 3));
    const now = new Date();

    const [income, expense] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'INCOME',
          date: { gte: threeMonthsAgo, lte: now },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          date: { gte: threeMonthsAgo, lte: now },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = Number(income._sum.amount || 0);
    const totalExpense = Number(expense._sum.amount || 0);
    const monthlySavings = (totalIncome - totalExpense) / 3;

    if (monthlySavings <= 0) {
      return {
        daysLeft: null,
        achievable: false,
        message: 'При текущем темпе цель недостижима. Попробуй сократить расходы или увеличить доход.',
      };
    }

    const monthsNeeded = remaining / monthlySavings;
    const daysLeft = Math.ceil(monthsNeeded * 30);

    let message = `При текущем темпе достигнешь через ${Math.ceil(monthsNeeded)} мес.`;
    if (daysLeft < 30) {
      message = `При текущем темпе достигнешь через ${daysLeft} дн.`;
    }

    return {
      daysLeft,
      achievable: true,
      monthlySavings: Math.round(monthlySavings),
      message,
    };
  }
}