'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  comment?: string;
  category?: { name: string; icon?: string };
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
    const formatCurrency = (amount: number) => {
    const currency = 'PLN'; // Можно брать из user.currency
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = format(date, 'd MMMM yyyy', { locale: ru });
    const formattedTime = format(date, 'HH:mm:ss'); // ← ТОЧНОЕ ВРЕМЯ!
    return { date: formattedDate, time: formattedTime };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Последние операции</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Пока нет операций. Добавь первую!
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => {
              const { date, time } = formatDateTime(t.date);
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
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
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {t.category?.name || 'Без категории'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{date}</span>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="font-mono">{time}</span> {/* ← ВРЕМЯ */}
                      </div>
                      {t.comment && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {t.comment}
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    className={`text-right font-semibold flex-shrink-0 ${
                      t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {t.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(t.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}