'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  comment?: string;
  category?: { name: string; icon?: string };
}

interface DailyDetailsProps {
  date: Date;
}

interface DailyData {
  date: string;
  income: number;
  expense: number;
  balance: number;
  transactions: Transaction[];
}

export function DailyDetails({ date }: DailyDetailsProps) {
  const { data, isLoading } = useQuery<DailyData>({
    queryKey: ['daily-summary', format(date, 'yyyy-MM-dd')],
    queryFn: async () => {
      const response = await api.get('/transactions/daily-summary', {
        params: { date: format(date, 'yyyy-MM-dd') },
      });
      return response.data.data;
    },
  });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {format(date, 'd MMMM yyyy, EEEE', { locale: ru })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Доход</span>
            </div>
            <p className="text-lg font-bold text-green-600">{formatCurrency(data.income)}</p>
          </div>
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-xs text-muted-foreground">Расход</span>
            </div>
            <p className="text-lg font-bold text-red-600">{formatCurrency(data.expense)}</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">Баланс</span>
            </div>
            <p className="text-lg font-bold text-blue-600">{formatCurrency(data.balance)}</p>
          </div>
        </div>

        {data.transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Нет операций за этот день
          </p>
        ) : (
          <div className="space-y-2">
            {data.transactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      t.type === 'INCOME'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}
                  >
                    {t.type === 'INCOME' ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {t.category?.name || 'Без категории'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.comment || format(new Date(t.date), 'HH:mm:ss')}
                    </p>
                  </div>
                </div>
                <div
                  className={`font-semibold ${
                    t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {t.type === 'INCOME' ? '+' : '-'}
                  {formatCurrency(Number(t.amount))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}