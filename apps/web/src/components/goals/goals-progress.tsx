'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchGoals, type Goal } from '@/services/goals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import Link from 'next/link';

export function GoalsProgress() {
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: fetchGoals,
  });

  // Показываем только активные цели (не достигнутые)
  const activeGoals = goals.filter((g) => g.progress < 100).slice(0, 3);

  if (activeGoals.length === 0) return null;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Прогресс целей
        </CardTitle>
        <Link href="/goals" className="text-sm text-primary hover:underline">
          Все цели →
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeGoals.map((goal) => (
          <div key={goal.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">{goal.title}</span>
              <span className="text-sm text-muted-foreground">
                {goal.progress.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, goal.progress)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(goal.current)}</span>
              <span>{formatCurrency(goal.target)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}