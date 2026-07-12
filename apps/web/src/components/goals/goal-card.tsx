'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { contributeToGoal, deleteGoal, type Goal } from '@/services/goals';
import { Target, Trash2, Plus, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const [showContribute, setShowContribute] = useState(false);
  const [amount, setAmount] = useState('');
  const queryClient = useQueryClient();

  const contributeMutation = useMutation({
    mutationFn: (amt: number) => contributeToGoal(goal.id, amt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setAmount('');
      setShowContribute(false);
      toast.success('Цель пополнена!');
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Ошибка';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteGoal(goal.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Цель удалена');
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Ошибка';
      toast.error(message);
    },
  });

  const handleContribute = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    contributeMutation.mutate(num);
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
    }).format(n);

  const progressColor =
    goal.progress >= 100
      ? 'from-green-500 to-emerald-500'
      : goal.progress >= 50
      ? 'from-blue-500 to-indigo-500'
      : goal.progress >= 25
      ? 'from-yellow-500 to-orange-500'
      : 'from-pink-500 to-rose-500';

  return (
    <Card className="p-5 space-y-4">
      {/* Заголовок */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{goal.title}</h3>
            {goal.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {goal.description}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm('Удалить цель?')) deleteMutation.mutate();
          }}
          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive flex-shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Прогресс-бар */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Прогресс</span>
          <span className="font-semibold">{goal.progress.toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${progressColor} transition-all duration-500 rounded-full`}
            style={{ width: `${Math.min(100, goal.progress)}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-medium">{formatCurrency(goal.current)}</span>
          <span className="text-muted-foreground">из {formatCurrency(goal.target)}</span>
        </div>
      </div>

      {/* Дедлайн */}
      {goal.deadline && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>До {format(new Date(goal.deadline), 'd MMMM yyyy', { locale: ru })}</span>
        </div>
      )}

      {/* Прогноз */}
      {goal.forecast.achievable && goal.progress < 100 && (
        <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
          <TrendingUp className="h-4 w-4 flex-shrink-0" />
          <span>{goal.forecast.message}</span>
        </div>
      )}

      {!goal.forecast.achievable && goal.progress < 100 && (
        <div className="text-sm p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300">
          {goal.forecast.message}
        </div>
      )}

      {goal.progress >= 100 && (
        <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold">
          🎉 Цель достигнута!
        </div>
      )}

      {/* Пополнение */}
      {showContribute ? (
        <div className="flex gap-2">
          <Input
            type="number"
            step="0.01"
            placeholder="Сумма"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleContribute()}
          />
          <Button
            onClick={handleContribute}
            isLoading={contributeMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            OK
          </Button>
          <Button variant="outline" onClick={() => setShowContribute(false)}>
            ✕
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => setShowContribute(true)}
          variant="outline"
          className="w-full"
          disabled={goal.progress >= 100}
        >
          <Plus className="h-4 w-4 mr-2" />
          Пополнить
        </Button>
      )}
    </Card>
  );
}