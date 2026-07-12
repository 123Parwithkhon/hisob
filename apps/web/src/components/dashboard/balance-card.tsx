'use client';

import { Wallet } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { getThemeById } from '@/lib/themes';

interface BalanceCardProps {
  balance: number;
  savingsRate: number;
}

export function BalanceCard({ balance, savingsRate }: BalanceCardProps) {
  const { user } = useAuthStore();
  const theme = getThemeById(user?.theme?.toLowerCase() || 'purple');

    const formatCurrency = (amount: number) => {
    const currency = user?.currency || 'PLN';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${theme.gradient} p-8 text-white shadow-xl transition-all duration-500`}
    >
      {/* Декоративные круги */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
      
      {/* Контент */}
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-white/80 text-sm font-medium mb-1">Баланс</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-3">
              {formatCurrency(balance)}
            </h2>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                <p className="text-sm font-medium">
                  Накопления: {savingsRate.toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
            <Wallet className="h-10 w-10 text-white/80" />
          </div>
        </div>
      </div>
    </div>
  );
}