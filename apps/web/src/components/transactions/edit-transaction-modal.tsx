'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  categoryId: string;
  date: string;
  place?: string;
  comment?: string;
}

interface EditTransactionModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export function EditTransactionModal({
  transaction,
  open,
  onOpenChange,
  onClose,
}: EditTransactionModalProps) {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<Transaction>();

  useEffect(() => {
    if (transaction) {
      setValue('type', transaction.type);
      setValue('amount', transaction.amount);
      setValue('categoryId', transaction.categoryId);
      setValue('date', transaction.date.split('T')[0]);
      setValue('place', transaction.place || '');
      setValue('comment', transaction.comment || '');
    }
  }, [transaction, setValue]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Transaction>) => {
      await api.put(`/transactions/${transaction?.id}`, data);
    },
    onSuccess: () => {
      toast.success('Транзакция обновлена!');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      reset();
      onClose();
    },
    onError: () => {
      toast.error('Ошибка при обновлении');
    },
  });

  const onSubmit = (data: Partial<Transaction>) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Редактировать транзакцию</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Тип транзакции */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={watch('type') === 'INCOME' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setValue('type', 'INCOME')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Доход
            </Button>
            <Button
              type="button"
              variant={watch('type') === 'EXPENSE' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setValue('type', 'EXPENSE')}
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Расход
            </Button>
          </div>

          {/* Сумма */}
          <div>
            <label className="text-sm font-medium">Сумма</label>
            <Input
              type="number"
              step="0.01"
              {...register('amount', { required: 'Обязательное поле', valueAsNumber: true })}
            />
            {errors.amount && <p className="text-red-500 text-xs">{errors.amount.message}</p>}
          </div>

          {/* Дата */}
          <div>
            <label className="text-sm font-medium">Дата</label>
            <Input type="date" {...register('date', { required: 'Обязательное поле' })} />
            {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
          </div>

          {/* Комментарий */}
          <div>
            <label className="text-sm font-medium">Комментарий</label>
            <Input {...register('comment')} placeholder="За что / откуда..." />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            isLoading={updateMutation.isPending}
          >
            Сохранить изменения
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}