'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { fetchCategories, createCategory, deleteCategory, type Category } from '@/services/categories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

export default function CategoriesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewCategoryName('');
      toast.success('Категория создана');
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Ошибка создания';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Категория удалена');
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Ошибка удаления';
      toast.error(message);
    },
  });

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleCreate = () => {
    if (!newCategoryName.trim()) return;
    createMutation.mutate({
      name: newCategoryName.trim(),
      type: newCategoryType,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
    });
  };

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
  const incomeCategories = categories.filter((c) => c.type === 'INCOME');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-4xl pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Категории</h1>
        </div>

        {/* Форма создания */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Новая категория</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setNewCategoryType('EXPENSE')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-medium transition-all ${
                  newCategoryType === 'EXPENSE'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-2 ring-red-500'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <TrendingDown className="h-4 w-4" />
                Расход
              </button>
              <button
                type="button"
                onClick={() => setNewCategoryType('INCOME')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-medium transition-all ${
                  newCategoryType === 'INCOME'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-2 ring-green-500'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Доход
              </button>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Название категории"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <Button onClick={handleCreate} isLoading={createMutation.isPending}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Категории расходов */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Расходы ({expenseCategories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {expenseCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: category.color || '#6b7280' }}
                    >
                      {category.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  {!category.isDefault && (
                    <button
                      onClick={() => deleteMutation.mutate(category.id)}
                      className="p-1 rounded hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Категории доходов */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Доходы ({incomeCategories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {incomeCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: category.color || '#6b7280' }}
                    >
                      {category.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  {!category.isDefault && (
                    <button
                      onClick={() => deleteMutation.mutate(category.id)}
                      className="p-1 rounded hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}