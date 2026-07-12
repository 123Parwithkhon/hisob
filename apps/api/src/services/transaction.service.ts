import { TransactionRepository } from '../repositories/transaction.repository.js';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import type { CreateTransactionDto, UpdateTransactionDto } from '../validators/transaction.validator.js';
import { NotFoundError } from '../utils/errors.js';

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
    return this.transactionRepo.create(userId, dto);
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
    // Регулярка: [знак] [число] [комментарий]
    // Примеры: +350, -20, -6 хлеб
    const regex = /^([+-])(\d+(?:[.,]\d+)?)\s*(.*)?$/;
    const match = command.match(regex);

    if (!match) {
      throw new Error('Неверный формат. Пример: +350 или -20 хлеб');
    }

    const [, sign, amountStr, comment] = match;
    const type = sign === '+' ? 'INCOME' : 'EXPENSE';
    
    // Заменяем запятую на точку, если есть
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
}