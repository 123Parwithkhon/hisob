'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Target } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createGoal } from '@/services/goals';
import { toast } from 'sonner';
import axios from 'axios';

const goalSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(100),
  description: z.string().max(500).optional(),
  target: z.number().positive('Цель должна быть больше 0'),
  deadline: z.string().optional(),
});

type GoalFormValues = z.infer<typeof goalSchema>;

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoalModal({ isOpen, onClose }: GoalModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '',
      description: '',
      target: 0,
      deadline: '',
    },
  });

  const onSubmit = async (data: GoalFormValues) => {
    setIsLoading(true);
    try {
      await createGoal({
        title: data.title,
        description: data.description,
        target: data.target,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Цель создана!');
      reset();
      onClose();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Ошибка создания';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-md z-10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Новая цель
          </CardTitle>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Название</label>
              <Input
                placeholder="Например: Новый iPhone"
                {...register('title')}
                error={errors.title?.message}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Описание</label>
              <Input
                placeholder="Необязательно"
                {...register('description')}
                error={errors.description?.message}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Целевая сумма (PLN)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="5000"
                {...register('target', { valueAsNumber: true })}
                error={errors.target?.message}
                className="text-xl font-bold text-center h-14"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Дедлайн (необязательно)</label>
              <Input type="date" {...register('deadline')} />
            </div>

            <Button type="submit" className="w-full h-12" isLoading={isLoading}>
              Создать цель
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}