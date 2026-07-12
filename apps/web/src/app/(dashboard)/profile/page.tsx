'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, LogOut, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // ✅ Правильный способ редиректа через useEffect
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    try {
      logout();
      toast.success('Вы вышли из аккаунта');
      router.push('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      toast.error('Ошибка при выходе');
    }
  };

  const handleEditProfile = () => {
    toast.info('Функция редактирования профиля скоро будет доступна');
  };

  const registeredDate = user?.createdAt
    ? format(new Date(user.createdAt), 'd MMMM yyyy', { locale: ru })
    : 'Неизвестно';

  // Пока проверяется авторизация — показываем loader
  if (!user) {
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
          <h1 className="text-3xl font-bold">Профиль</h1>
        </div>

        {/* Карточка пользователя */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>📱</span>
                    {user.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Зарегистрирован {registeredDate}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditProfile}
              >
                <Edit className="h-4 w-4 mr-2" />
                Редактировать
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Информация */}
        <Card>
          <CardHeader>
            <CardTitle>Информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Часовой пояс</span>
              <span className="text-sm font-medium">{user.timezone || 'Asia/Tashkent'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Тема</span>
              <span className="text-sm font-medium">
                {user.theme === 'LIGHT' ? 'Светлая' : user.theme === 'DARK' ? 'Тёмная' : 'Системная'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Роль</span>
              <span className="text-sm font-medium">
                {user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Действия */}
        <Card>
          <CardHeader>
            <CardTitle>Действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/settings')}
            >
              <Edit className="h-4 w-4 mr-2" />
              Настройки аккаунта
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Выйти из аккаунта
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}