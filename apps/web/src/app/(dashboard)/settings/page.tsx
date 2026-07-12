'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Palette, Layout } from 'lucide-react';
import { themes, backgroundPatterns } from '@/lib/themes';
import { toast } from 'sonner';

const timezones = [
  { value: 'Asia/Dushanbe', label: 'Душанбе (UTC+5)' },
  { value: 'Asia/Tashkent', label: 'Ташкент (UTC+5)' },
  { value: 'Europe/Warsaw', label: 'Варшава (UTC+1)' },
  { value: 'Europe/Moscow', label: 'Москва (UTC+3)' },
  { value: 'Europe/Kiev', label: 'Киев (UTC+2)' },
  { value: 'Asia/Dubai', label: 'Дубай (UTC+4)' },
  { value: 'Asia/Almaty', label: 'Алматы (UTC+6)' },
];

const currencies = [
  { value: 'TJS', label: 'TJS — Таджикский сомони' },
  { value: 'PLN', label: 'PLN — Польский злотый' },
  { value: 'USD', label: 'USD — Доллар США' },
  { value: 'EUR', label: 'EUR — Евро' },
  { value: 'RUB', label: 'RUB — Российский рубль' },
  { value: 'UZS', label: 'UZS — Узбекский сум' },
  { value: 'KZT', label: 'KZT — Казахский тенге' },
  { value: 'GBP', label: 'GBP — Британский фунт' },
];

// ✅ Helper для безопасного чтения localStorage на клиенте
function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  // ✅ Lazy initialization — читаем localStorage ОДИН РАЗ при монтировании
  const [selectedTheme, setSelectedTheme] = useState<string>(
    () => user?.theme?.toLowerCase() ?? 'purple'
  );
  const [selectedBackground, setSelectedBackground] = useState<string>(
    () => readLocalStorage<string>('backgroundPattern', 'gradient-dots')
  );
  const [selectedTimezone, setSelectedTimezone] = useState<string>(
    () => user?.timezone ?? 'Asia/Dushanbe'
  );
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    () => user?.currency ?? 'TJS'
  );
  const [notifications, setNotifications] = useState(() =>
    readLocalStorage('notifications', { push: true, email: false, reminders: true })
  );

  // ✅ Правильный редирект через useEffect (без setState)
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleSave = () => {
    if (!user) return;

    setUser({
      ...user,
      theme: selectedTheme.toUpperCase() as 'LIGHT' | 'DARK' | 'SYSTEM',
      timezone: selectedTimezone,
      currency: selectedCurrency,
    });

    localStorage.setItem('backgroundPattern', selectedBackground);
    localStorage.setItem('notifications', JSON.stringify(notifications));

    // Dispatch событие для обновления фона в layout
    window.dispatchEvent(new Event('backgroundPatternChanged'));
    toast.success('Настройки сохранены!');
  };

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
          <h1 className="text-3xl font-bold">Настройки</h1>
        </div>

        {/* Оформление Dashboard (ГРАДИЕНТЫ) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Оформление Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Выбери красивый градиент для карточки баланса
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`relative overflow-hidden rounded-xl p-4 text-left transition-all ${
                    selectedTheme === theme.id
                      ? 'ring-2 ring-primary ring-offset-2'
                      : 'hover:ring-2 hover:ring-muted-foreground/20'
                  }`}
                >
                  <div
                    className={`h-16 rounded-lg bg-gradient-to-r ${theme.gradient} mb-3`}
                  />
                  <h3 className="font-semibold text-sm mb-1">{theme.name}</h3>
                  <p className="text-xs text-muted-foreground">{theme.description}</p>
                  {selectedTheme === theme.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ФОНОВЫЕ УЗОРЫ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5 text-primary" />
              Фон сайта
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Выбери узор для фона всего приложения
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {backgroundPatterns.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => setSelectedBackground(pattern.id)}
                  className={`relative overflow-hidden rounded-xl p-4 text-left transition-all border-2 ${
                    selectedBackground === pattern.id
                      ? 'border-primary'
                      : 'border-muted-foreground/20'
                  }`}
                >
                  <div
                    className="h-16 rounded-lg bg-background mb-3"
                    style={{
                      backgroundImage: pattern.background,
                      backgroundSize: pattern.backgroundSize || 'auto',
                    }}
                  />
                  <h3 className="font-semibold text-sm mb-1">{pattern.name}</h3>
                  <p className="text-xs text-muted-foreground">{pattern.description}</p>
                  {selectedBackground === pattern.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Часовой пояс */}
        <Card>
          <CardHeader>
            <CardTitle>Часовой пояс</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Валюта по умолчанию */}
        <Card>
          <CardHeader>
            <CardTitle>Валюта по умолчанию</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            >
              {currencies.map((curr) => (
                <option key={curr.value} value={curr.value}>
                  {curr.label}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Уведомления */}
        <Card>
          <CardHeader>
            <CardTitle>Уведомления</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
              <span className="text-sm">Push-уведомления</span>
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={(e) =>
                  setNotifications({ ...notifications, push: e.target.checked })
                }
                className="w-5 h-5 rounded"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
              <span className="text-sm">Email-уведомления</span>
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={(e) =>
                  setNotifications({ ...notifications, email: e.target.checked })
                }
                className="w-5 h-5 rounded"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
              <span className="text-sm">Напоминания о расходах</span>
              <input
                type="checkbox"
                checked={notifications.reminders}
                onChange={(e) =>
                  setNotifications({ ...notifications, reminders: e.target.checked })
                }
                className="w-5 h-5 rounded"
              />
            </label>
          </CardContent>
        </Card>

        {/* Кнопка сохранения */}
        <Button onClick={handleSave} className="w-full h-12">
          <Save className="h-4 w-4 mr-2" />
          Сохранить настройки
        </Button>
      </div>
    </div>
  );
}