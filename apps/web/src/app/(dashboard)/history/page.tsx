'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/services/api';
import { exportToExcel } from '@/services/export';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  currency: string;
  date: string;
  category?: { name: string };
  place?: string;
  comment?: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const { data, isLoading } = useQuery<{ transactions: Transaction[] }>({
    queryKey: ['transactions', 'history', typeFilter, search],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (search) params.search = search;
      const response = await api.get('/transactions', { params });
      return response.data.data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleExport = () => {
    if (!data?.transactions || data.transactions.length === 0) {
      toast.error('Нет данных для экспорта');
      return;
    }

    try {
      exportToExcel({
        transactions: data.transactions,
        filename: `hisob-history-${format(new Date(), 'yyyy-MM-dd')}.xlsx`,
        includeStats: true,
      });
      toast.success('Файл экспортирован!');
    } catch {
      toast.error('Ошибка при экспорте');
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-6xl pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">История операций</h1>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Экспорт в Excel
          </Button>
        </div>

        {/* Фильтры */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по комментарию или месту..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={typeFilter === 'ALL' ? 'primary' : 'outline'}
                onClick={() => setTypeFilter('ALL')}
                size="sm"
              >
                Все
              </Button>
              <Button
                variant={typeFilter === 'INCOME' ? 'primary' : 'outline'}
                onClick={() => setTypeFilter('INCOME')}
                size="sm"
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Доходы
              </Button>
              <Button
                variant={typeFilter === 'EXPENSE' ? 'primary' : 'outline'}
                onClick={() => setTypeFilter('EXPENSE')}
                size="sm"
              >
                <TrendingDown className="h-4 w-4 mr-1" />
                Расходы
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Список транзакций */}
        {!data?.transactions || data.transactions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Нет операций</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {data.transactions.map((t) => (
              <Card key={t.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          t.type === 'INCOME'
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}
                      >
                        {t.type === 'INCOME' ? (
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">
                          {t.category?.name || 'Без категории'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(t.date), 'd MMMM yyyy, HH:mm:ss', { locale: ru })}
                        </p>
                        {(t.place || t.comment) && (
                          <p className="text-sm text-muted-foreground truncate">
                            {t.place && <span className="font-medium">{t.place}</span>}
                            {t.place && t.comment && ' — '}
                            {t.comment}
                          </p>
                        )}
                      </div>
                    </div>
                    <div
                      className={`text-xl font-bold ${
                        t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {t.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(t.amount)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}