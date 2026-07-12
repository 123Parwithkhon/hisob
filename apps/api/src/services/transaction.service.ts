import { TransactionRepository } from '../repositories/transaction.repository.js';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import type { CreateTransactionDto, UpdateTransactionDto } from '../validators/transaction.validator.js';
import { NotFoundError } from '../utils/errors.js';
import { prisma } from '../config/prisma.js';

export class TransactionService {
  private transactionRepo: TransactionRepository;

  constructor() {
    this.transactionRepo = new TransactionRepository();
  }

  async getDashboardStats(userId: string) {
    const now = new Date();

    const [todayIncome, todayExpense] = await Promise.all([
      this.transactionRepo.getStatsByPeriod(userId, 'INCOME', startOfDay(now), endOfDay(now)),
      this.transactionRepo.getStatsByPeriod(userId, 'EXPENSE', startOfDay(now), endOfDay(now)),
    ]);

    const [weekIncome, weekExpense] = await Promise.all([
      this.transactionRepo.getStatsByPeriod(userId, 'INCOME', startOfWeek(now), endOfWeek(now)),
      this.transactionRepo.getStatsByPeriod(userId, 'EXPENSE', startOfWeek(now), endOfWeek(now)),
    ]);

    const [monthIncome, monthExpense] = await Promise.all([
      this.transactionRepo.getStatsByPeriod(userId, 'INCOME', startOfMonth(now), endOfMonth(now)),
      this.transactionRepo.getStatsByPeriod(userId, 'EXPENSE', startOfMonth(now), endOfMonth(now)),
    ]);

    const balance = await this.transactionRepo.getBalance(userId);
    const recentTransactions = await this.transactionRepo.getRecentTransactions(userId, 10);

    const savingsRate =
      monthIncome.total > 0
        ? ((monthIncome.total - monthExpense.total) / monthIncome.total) * 100
        : 0;

    return {
      today: { income: todayIncome.total, expense: todayExpense.total, count: todayIncome.count + todayExpense.count },
      week: { income: weekIncome.total, expense: weekExpense.total, count: weekIncome.count + weekExpense.count },
      month: { income: monthIncome.total, expense: monthExpense.total, count: monthIncome.count + monthExpense.count },
      balance: balance.balance,
      totalIncome: balance.income,
      totalExpense: balance.expense,
      savingsRate: Math.max(0, savingsRate),
      recentTransactions,
    };
  }

    async create(userId: string, dto: CreateTransactionDto) {
    console.log('\n💰 [TRANSACTION] Создание транзакции...');
    console.log(' [TRANSACTION] userId:', userId);
    console.log('💰 [TRANSACTION] Данные:', dto);

    try {
      // Если есть categoryId, проверяем что она существует
      if (dto.categoryId) {
        console.log(' [TRANSACTION] Проверка категории:', dto.categoryId);
        const category = await prisma.category.findUnique({
          where: { id: dto.categoryId },
        });
        if (!category) {
          throw new Error(`Категория ${dto.categoryId} не найдена`);
        }
        console.log('✅ [TRANSACTION] Категория найдена:', category.name);
      }

      // Если есть workUnitId, проверяем что она существует
      if (dto.workUnitId) {
        console.log('💰 [TRANSACTION] Проверка единицы работы:', dto.workUnitId);
        const workUnit = await prisma.workUnit.findUnique({
          where: { id: dto.workUnitId },
        });
        if (!workUnit) {
          throw new Error(`Единица работы ${dto.workUnitId} не найдена`);
        }
        console.log('✅ [TRANSACTION] Единица работы найдена:', workUnit.name);
      }

      console.log('💰 [TRANSACTION] Создание в БД...');
      const transaction = await this.transactionRepo.create(userId, dto);
      console.log('✅ [TRANSACTION] Транзакция создана:', transaction.id);
      console.log(' [TRANSACTION] Данные:', {
        type: transaction.type,
        amount: transaction.amount,
        date: transaction.date,
      });

      return transaction;
    } catch (error) {
      console.error('\n❌ [TRANSACTION] ОШИБКА:');
      console.error('❌ Тип:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('❌ Сообщение:', error instanceof Error ? error.message : String(error));
      console.error('❌ Stack:', error instanceof Error ? error.stack : 'N/A');
      throw error;
    }
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const transaction = await this.transactionRepo.findById(userId, id);
    if (!transaction) throw new NotFoundError('Транзакция не найдена');
    return this.transactionRepo.update(id, dto);
  }

  async delete(userId: string, id: string) {
    const transaction = await this.transactionRepo.findById(userId, id);
    if (!transaction) throw new NotFoundError('Транзакция не найдена');
    await this.transactionRepo.delete(id);
    return { success: true };
  }

  async list(
    userId: string,
    filters: {
      type?: 'INCOME' | 'EXPENSE';
      from?: Date;
      to?: Date;
      categoryId?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const transactions = await this.transactionRepo.listByUser(userId, { ...filters, skip, take: limit });

    return { transactions, meta: { page, limit } };
  }

  async quickInput(userId: string, command: string) {
    const regex = /^([+-])(\d+(?:[.,]\d+)?)\s*(.*)?$/;
    const match = command.match(regex);

    if (!match) {
      throw new Error('Неверный формат. Пример: +350 или -20 хлеб');
    }

    const [, sign, amountStr, comment] = match;
    const type = sign === '+' ? 'INCOME' : 'EXPENSE';
    const amount = parseFloat(amountStr.replace(',', '.'));

    return this.transactionRepo.create(userId, {
      type: type as 'INCOME' | 'EXPENSE',
      amount,
      date: new Date(),
      comment: comment?.trim() || undefined,
      currency: 'PLN',
      quickInput: true,
    });
  }

  async getByDateRange(userId: string, startDate: Date, endDate: Date) {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'desc' },
      include: { category: true },
    });

    const groupedByDate: Record<string, {
      date: string;
      transactions: typeof transactions;
      income: number;
      expense: number;
      balance: number;
    }> = {};

    transactions.forEach((t) => {
      const dateKey = t.date.toISOString().split('T')[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          date: dateKey,
          transactions: [],
          income: 0,
          expense: 0,
          balance: 0,
        };
      }
      groupedByDate[dateKey].transactions.push(t);
      if (t.type === 'INCOME') {
        groupedByDate[dateKey].income += Number(t.amount);
      } else {
        groupedByDate[dateKey].expense += Number(t.amount);
      }
      groupedByDate[dateKey].balance =
        groupedByDate[dateKey].income - groupedByDate[dateKey].expense;
    });

    return Object.values(groupedByDate);
  }

  async getDailySummary(userId: string, date: Date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: dayStart, lte: dayEnd },
      },
      orderBy: { date: 'desc' },
      include: { category: true },
    });

    const income = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      date: date.toISOString().split('T')[0],
      transactions,
      income,
      expense,
      balance: income - expense,
    };
  }
}