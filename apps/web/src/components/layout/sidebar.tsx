'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { href: '/dashboard', label: 'Главная', icon: Home },
  { href: '/calendar', label: 'Календарь', icon: Calendar },
  { href: '/goals', label: 'Цели', icon: Target },
  { href: '/analytics', label: 'Аналитика', icon: BarChart3 },
  { href: '/history', label: 'История', icon: History },
];

const secondaryNavItems = [
  { href: '/categories', label: 'Категории', icon: Tag },
  { href: '/work-units', label: 'Единицы работы', icon: Package },
  { href: '/reminders', label: 'Напоминания', icon: Bell },
  { href: '/profile', label: 'Профиль', icon: User },
  { href: '/settings', label: 'Настройки', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background border-r h-screen sticky top-0">
      {/* Логотип */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-primary">Hisob</h1>
        <p className="text-xs text-muted-foreground mt-1">Учёт финансов</p>
      </div>

      {/* Основная навигация */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-3">
            Основное
          </p>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-3">
            Управление
          </p>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Футер */}
      <div className="p-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Hisob v1.0.0
        </p>
      </div>
    </aside>
  );
}