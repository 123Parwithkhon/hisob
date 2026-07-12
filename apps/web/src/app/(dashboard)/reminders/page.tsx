'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { fetchReminders, createReminder, deleteReminder, type Reminder } from '@/services/notifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Bell, Calendar, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function RemindersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

  const { data: reminders = [], isLoading } = useQuery<Reminder[]>({
    queryKey: ['reminders'],
    queryFn: fetchReminders,
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: createReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setShowForm(false);
      setTitle('');
      setMessage('');
      setScheduledAt('');
      setRepeat('none');
      toast.success('Напоминание создано');
    },
    onError: (error: unknown) => {
      const msg = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Ошибка создания';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Напоминание удалено');
    },
    onError: (error: unknown) => {
      const msg = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Ошибка удаления';
      toast.error(msg);
    },
  });

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleCreate = () => {
    if (!title.trim() || !scheduledAt) {
      toast.error('Заполните название и дату');
      return;
    }
    createMutation.mutate({
      title: title.trim(),
      message: message.trim() || undefined,
      scheduledAt: new Date(scheduledAt).toISOString(),
      repeat,
    });
  };

  const getRepeatLabel = (repeat: string) => {
    switch (repeat) {
      case 'DAILY': return 'Ежедневно';
      case 'WEEKLY': return 'Еженедельно';
      case 'MONTHLY': return 'Ежемесячно';
      default: return 'Однократно';
    }
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
          <h1 className="text-3xl font-bold">Напоминания</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Новое напоминание
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Создать напоминание</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Название</label>
                <Input
                  placeholder="Например: Записать расходы"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Сообщение (необязательно)</label>
                <Input
                  placeholder="Дополнительная информация"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Дата и время</label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Повторение</label>
                <select
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value as 'none' | 'daily' | 'weekly' | 'monthly')}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="none">Не повторять</option>
                  <option value="daily">Ежедневно</option>
                  <option value="weekly">Еженедельно</option>
                  <option value="monthly">Ежемесячно</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreate} isLoading={createMutation.isPending}>
                  Создать
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {reminders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Нет напоминаний</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <Card key={reminder.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{reminder.title}</h3>
                      {reminder.message && (
                        <p className="text-sm text-muted-foreground mt-1">{reminder.message}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(reminder.scheduledAt), 'd MMM yyyy, HH:mm', { locale: ru })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Repeat className="h-4 w-4" />
                          {getRepeatLabel(reminder.repeat)}
                        </div>
                      </div>
                      {!reminder.isActive && (
                        <span className="inline-block mt-2 px-2 py-1 rounded bg-muted text-xs text-muted-foreground">
                          Завершено
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteMutation.mutate(reminder.id)}
                      className="p-2 rounded hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}