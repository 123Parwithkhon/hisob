'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { fetchWorkUnits, type WorkUnit } from '@/services/work-units';
import { CategorySelector } from './category-selector';

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive('Сумма должна быть больше 0'),
  date: z.string().min(1, 'Дата обязательна'),
  categoryId: z.string().optional(),
  workUnitId: z.string().optional(),
  quantity: z.number().positive().optional(),
  comment: z.string().max(300).optional(),
  place: z.string().max(100).optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'INCOME' | 'EXPENSE';
}

export function TransactionModal({ isOpen, onClose, defaultType = 'INCOME' }: TransactionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultType,
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      workUnitId: undefined,
      quantity: undefined,
      categoryId: undefined,
      comment: '',
      place: '',
    },
  });

  const currentType = useWatch({ control, name: 'type' });
  const currentCategoryId = useWatch({ control, name: 'categoryId' });
  const currentWorkUnitId = useWatch({ control, name: 'workUnitId' });

  // Загрузка единиц работы
  const { data: workUnits = [] } = useQuery<WorkUnit[]>({
    queryKey: ['work-units'],
    queryFn: fetchWorkUnits,
  });

  const onSubmit = async (data: TransactionFormValues) => {
    setIsLoading(true);
    try {
      await api.post('/transactions', {
        ...data,
        date: new Date(data.date),
        categoryId: data.categoryId || null,
        workUnitId: data.workUnitId || null,
        quantity: data.quantity || null,
      });
      toast.success(data.type === 'INCOME' ? 'Доход добавлен!' : 'Расход добавлен!');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['work-units'] });
      reset();
      onClose();
    } catch {
      toast.error('Ошибка при добавлении');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-md z-10 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-card z-10">
          <CardTitle className="text-xl">
            {currentType === 'INCOME' ? '➕ Новый доход' : '➖ Новый расход'}
          </CardTitle>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Выбор типа */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setValue('type', 'INCOME');
                  setValue('categoryId', undefined);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                  currentType === 'INCOME'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-2 ring-green-500'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Доход
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('type', 'EXPENSE');
                  setValue('categoryId', undefined);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                  currentType === 'EXPENSE'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-2 ring-red-500'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <TrendingDown className="h-4 w-4" />
                Расход
              </button>
            </div>

            {/* Сумма */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Сумма (PLN)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
                error={errors.amount?.message}
                className="text-2xl font-bold text-center h-14"
              />
            </div>

            {/* Категория */}
            <CategorySelector
              type={currentType}
              selectedId={currentCategoryId}
              onSelect={(id: string) => setValue('categoryId', id)}
            />

            {/* Единица работы (если есть) */}
            {workUnits.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Единица работы</label>
                <select
                  {...register('workUnitId')}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Не выбрано</option>
                  {workUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Количество (если выбрана единица работы) */}
            {currentWorkUnitId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Количество</label>
                <Input
                  type="number"
                  step="1"
                  placeholder="47"
                  {...register('quantity', { valueAsNumber: true })}
                  error={errors.quantity?.message}
                />
                <p className="text-xs text-muted-foreground">
                  Например: 47 ящиков, 15 часов
                </p>
              </div>
            )}

            {/* Дата */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Дата</label>
              <Input type="date" {...register('date')} error={errors.date?.message} />
            </div>

            {/* Место */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Место</label>
              <Input
                type="text"
                placeholder="Магазин, работа..."
                {...register('place')}
                error={errors.place?.message}
              />
            </div>

            {/* Комментарий */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Комментарий</label>
              <Input
                type="text"
                placeholder="За что / откуда..."
                {...register('comment')}
                error={errors.comment?.message}
              />
            </div>

            {/* Кнопка отправки */}
            <Button
              type="submit"
              className="w-full h-12 text-lg"
              isLoading={isLoading}
              style={{
                backgroundColor: currentType === 'INCOME' ? '#22c55e' : '#ef4444',
              }}
            >
              {currentType === 'INCOME' ? 'Добавить доход' : 'Добавить расход'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}