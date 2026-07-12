import { Card } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  savingsRate: number;
}

export function BalanceCard({ balance, savingsRate }: BalanceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm opacity-80 mb-1">Баланс</p>
          <p className="text-4xl font-bold">{formatCurrency(balance)}</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="text-sm opacity-80">Накопления:</div>
            <div className="text-sm font-semibold">{savingsRate.toFixed(0)}%</div>
          </div>
        </div>
        <Wallet className="h-16 w-16 opacity-30" />
      </div>
    </Card>
  );
}