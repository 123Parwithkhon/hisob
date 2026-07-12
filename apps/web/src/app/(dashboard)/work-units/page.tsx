'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { fetchWorkUnits, createWorkUnit, deleteWorkUnit, type WorkUnit } from '@/services/work-units';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

export default function WorkUnitsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [newWorkUnitName, setNewWorkUnitName] = useState('');

  const { data: workUnits = [], isLoading } = useQuery<WorkUnit[]>({
    queryKey: ['work-units'],
    queryFn: fetchWorkUnits,
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: createWorkUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-units'] });
      setNewWorkUnitName('');
      toast.success('Единица работы создана');
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Ошибка создания';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorkUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-units'] });
      toast.success('Единица работы удалена');
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
    if (!newWorkUnitName.trim()) return;
    createMutation.mutate({
      name: newWorkUnitName.trim(),
    });
  };

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
          <h1 className="text-3xl font-bold">Единицы работы</h1>
        </div>

        {/* Форма создания */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Новая единица работы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Например: ящик, ряд, час, корзина"
                value={newWorkUnitName}
                onChange={(e) => setNewWorkUnitName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <Button onClick={handleCreate} isLoading={createMutation.isPending}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Список единиц */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Единицы ({workUnits.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {workUnits.map((workUnit) => (
                <div
                  key={workUnit.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{workUnit.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {workUnit._count.transactions} транзакций
                      </p>
                    </div>
                  </div>
                  {workUnit._count.transactions === 0 && (
                    <button
                      onClick={() => deleteMutation.mutate(workUnit.id)}
                      className="p-2 rounded hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {workUnits.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Пока нет единиц работы. Создайте первую!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}