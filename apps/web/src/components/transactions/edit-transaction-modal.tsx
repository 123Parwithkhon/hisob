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
import { useWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface EditTransactionData {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  categoryId: string;
  date: string;
  place?: string;
  comment?: string;
}

interface EditTransactionModalProps {
  transaction: EditTransactionData | null;
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

const { register, handleSubmit, setValue, reset, control, formState: { errors } } = useForm<EditTransactionData>();


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
    mutationFn: async (data: Partial<EditTransactionData>) => {
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

  const onSubmit = (data: Partial<EditTransactionData>) => {
    updateMutation.mutate(data);
  };

  const currentType = useWatch({ control, name: 'type', defaultValue: 'EXPENSE' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Редактировать транзакцию</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              // ✅ ИЗМЕНЕНО: 'default' вместо 'primary'
              variant={currentType === 'INCOME' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setValue('type', 'INCOME')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Доход
            </Button>
            <Button
              type="button"
              variant={currentType === 'EXPENSE' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setValue('type', 'EXPENSE')}
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Расход
            </Button>
          </div>

          <div>
            <label className="text-sm font-medium">Сумма</label>
            <Input
              type="number"
              step="0.01"
              {...register('amount', { required: 'Обязательное поле', valueAsNumber: true })}
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Дата</label>
            <Input type="date" {...register('date', { required: 'Обязательное поле' })} />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Комментарий</label>
            <Input {...register('comment')} placeholder="За что / откуда..." />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}