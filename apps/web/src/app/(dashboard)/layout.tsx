'use client';

import { useState, useSyncExternalStore } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { Menu } from 'lucide-react';

// ✅ Внешний store для localStorage — правильный React 19 способ
const backgroundStore = {
  subscribe(callback: () => void) {
    // Слушаем изменения localStorage
    const handler = (e: StorageEvent) => {
      if (e.key === 'backgroundPattern') callback();
    };
    window.addEventListener('storage', handler);
    // Также слушаем кастомное событие для обновлений в той же вкладке
    window.addEventListener('backgroundPatternChanged', callback);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('backgroundPatternChanged', callback);
    };
  },
  getSnapshot() {
    return localStorage.getItem('backgroundPattern') || 'dots';
  },
  getServerSnapshot() {
    return 'dots';
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Нет setState — просто читаем из store
  const backgroundPattern = useSyncExternalStore(
    backgroundStore.subscribe,
    backgroundStore.getSnapshot,
    backgroundStore.getServerSnapshot
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className="flex min-h-screen"
      data-bg-pattern={backgroundPattern}
      style={{
        backgroundImage: 'var(--background-pattern)',
        backgroundSize: 'var(--background-pattern-size)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Сайдбар для десктопа */}
      <Sidebar />

      {/* Основной контент */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Верхняя панель (мобильная) */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b md:hidden">
          <div className="px-4 py-3 flex justify-between items-center">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Открыть меню"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-primary">Hisob</h1>
            <NotificationBell />
          </div>
        </div>

        {/* Контент */}
        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        {/* Нижняя навигация для мобильных */}
        <BottomNav />
      </div>

      {/* Мобильное меню */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  );
}