'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead, deleteNotification, type Notification } from '@/services/notifications';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: fetchUnreadCount,
    refetchInterval: 30000, // Обновлять каждые 30 секунд
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => fetchNotifications(false),
    enabled: isOpen,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <Card className="absolute right-0 top-12 w-96 max-h-[500px] overflow-y-auto z-50 shadow-lg">
            <CardContent className="p-0">
              <div className="sticky top-0 bg-card border-b p-3 flex items-center justify-between">
                <h3 className="font-semibold">Уведомления</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllAsReadMutation.mutate()}
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Прочитать все
                  </Button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Нет уведомлений
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 transition-colors ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </p>
                          {notification.message && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(notification.createdAt), 'd MMM, HH:mm', { locale: ru })}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {!notification.read && (
                            <button
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                              className="p-1 rounded hover:bg-muted"
                              title="Отметить как прочитанное"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteMutation.mutate(notification.id)}
                            className="p-1 rounded hover:bg-destructive/10 text-destructive"
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}