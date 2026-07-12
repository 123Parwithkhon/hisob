'use client';

import { useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Внешний store для deferredPrompt
let deferredPromptStore: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return deferredPromptStore;
}

function notifyListeners() {
  listeners.forEach((l) => l());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPromptStore = e as BeforeInstallPromptEvent;
    notifyListeners();
  });
}

// Хелпер для проверки режима standalone
function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches;
}

export function InstallPrompt() {
  // Используем useSyncExternalStore для подписки на deferredPrompt
  const deferredPrompt = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Используем useSyncExternalStore для проверки standalone
  const isInstalled = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia('(display-mode: standalone)');
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    isStandalone,
    isStandalone
  );

  // Вычисляем showPrompt напрямую — это производное состояние!
  const showPrompt = !isInstalled && !!deferredPrompt;

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      deferredPromptStore = null;
      notifyListeners();
    }
  };

  const handleDismiss = () => {
    deferredPromptStore = null;
    notifyListeners();
  };

  if (!showPrompt) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Установить Hisob</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Быстрый доступ к приложению прямо с рабочего стола
            </p>
            <div className="flex gap-2">
              <Button onClick={handleInstall} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Установить
              </Button>
              <Button onClick={handleDismiss} variant="ghost" size="sm">
                Позже
              </Button>
            </div>
          </div>
          <button onClick={handleDismiss} className="p-1 rounded hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}