'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
   import { Insights } from '@/components/analytics/insights';
import { useAuthStore } from '@/store/auth.store';
   import { GoalsProgress } from '@/components/goals/goals-progress';
import { api } from '@/services/api';
import { BalanceCard } from '@/components/dashboard/balance-card';
import { StatCard } from '@/components/dashboard/stat-card';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { TransactionModal } from '@/components/transactions/transaction-modal';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { QuickInput } from '@/components/dashboard/quick-input';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  comment?: string;
  category?: { name: string; icon?: string };
}

interface DashboardData {
  today: { income: number; expense: number; count: number };
  week: { income: number; expense: number; count: number };
  month: { income: number; expense: number; count: number };
  balance: number;
  totalIncome: number;
  totalExpense: number;
  savingsRate: number;
  recentTransactions: Transaction[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'INCOME' | 'EXPENSE'>('INCOME');

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/transactions/dashboard');
      return response.data.data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const openModal = (type: 'INCOME' | 'EXPENSE') => {
    setModalType(type);
    setModalOpen(true);
  };

  if (error) {
    toast.error('Ошибка загрузки данных');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Нет данных</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        <BalanceCard balance={data.balance} savingsRate={data.savingsRate} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Сегодня" income={data.today.income} expense={data.today.expense} />
          <StatCard title="Неделя" income={data.week.income} expense={data.week.expense} />
          <StatCard title="Месяц" income={data.month.income} expense={data.month.expense} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            className="w-full h-16 text-lg bg-green-600 hover:bg-green-700"
            onClick={() => openModal('INCOME')}
          >
            <Plus className="mr-2 h-5 w-5" />
            Доход
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full h-16 text-lg border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => openModal('EXPENSE')}
          >
            <Minus className="mr-2 h-5 w-5" />
            Расход
          </Button>
          <QuickInput />
        </div>
           <Insights />
              <GoalsProgress />
        <RecentTransactions transactions={data.recentTransactions} />
      </div>

      <TransactionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} defaultType={modalType} />
    </div>
  );
}