'use client';

import { TrendingUp, TrendingDown, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  categoryId: string;
  date: string;
  comment?: string;
  category?: { name: string; icon?: string };
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  onEditTransaction?: (t: Transaction) => void;
}

export function RecentTransactions({ 
  transactions, 
  onEditTransaction 
}: RecentTransactionsProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8 text-sm">
        Нет недавних операций
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* ✅ ВОТ ЗДЕСЬ .map() создает переменную transaction */}
      {transactions.map((transaction) => (
        <div 
          key={transaction.id} 
          className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              transaction.type === 'INCOME' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {transaction.type === 'INCOME' ? (
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {transaction.category?.name || 'Без категории'}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(transaction.date), 'dd MMMM yyyy', { locale: ru })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <span className={`font-bold ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.type === 'INCOME' ? '+' : '-'}{Number(transaction.amount).toFixed(2)}
            </span>
            
            {onEditTransaction && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditTransaction(transaction)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}