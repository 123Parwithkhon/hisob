'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { fetchGoals, type Goal } from '@/services/goals';
import { GoalCard } from '@/components/goals/goal-card';
import { GoalModal } from '@/components/goals/goal-modal';
import { Button } from '@/components/ui/button';
import { Plus, Target } from 'lucide-react';

export default function GoalsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: fetchGoals,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-5xl pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Мои цели</h1>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Новая цель
          </Button>
        </div>

        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Target className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Пока нет целей</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Создай свою первую финансовую цель и отслеживай прогресс её достижения
            </p>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Создать первую цель
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </div>

      <GoalModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}