'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import {
  Home,
  Calendar,
  Target,
  BarChart3,
  User,
  History,
  Bell,
  Settings,
  Package,
  Tag,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { href: '/dashboard', label: 'Главная', icon: Home, group: 'Основное' },
  { href: '/calendar', label: 'Календарь', icon: Calendar, group: 'Основное' },
  { href: '/goals', label: 'Цели', icon: Target, group: 'Основное' },
  { href: '/analytics', label: 'Аналитика', icon: BarChart3, group: 'Основное' },
  { href: '/history', label: 'История', icon: History, group: 'Основное' },
  { href: '/categories', label: 'Категории', icon: Tag, group: 'Управление' },
  { href: '/work-units', label: 'Единицы работы', icon: Package, group: 'Управление' },
  { href: '/reminders', label: 'Напоминания', icon: Bell, group: 'Управление' },
  { href: '/profile', label: 'Профиль', icon: User, group: 'Аккаунт' },
  { href: '/settings', label: 'Настройки', icon: Settings, group: 'Аккаунт' },
];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Блокируем скролл body когда меню открыто
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Закрываем меню при изменении маршрута
  useEffect(() => {
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => {
    logout();
    toast.success('Вы вышли из аккаунта');
    router.push('/login');
  };

  // Группируем пункты меню
  const groups = menuItems.reduce<Record<string, typeof menuItems>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Меню */}
      <div
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] bg-background shadow-2xl transition-transform duration-300 md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Шапка */}
        <div className="p-6 border-b bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-primary">Hisob</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Закрыть меню"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Навигация */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {Object.entries(groups).map(([groupName, items]) => (
            <div key={groupName}>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-3">
                {groupName}
              </p>
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-muted'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Футер с кнопкой выхода */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Выйти из аккаунта</span>
          </button>
        </div>
      </div>
    </>
  );
}