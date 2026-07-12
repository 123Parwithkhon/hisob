'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Globe, Zap, Shield } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-4xl pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">О приложении</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Hisob v1.0.0</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Hisob — это современное приложение для учёта личных финансов.
              Простое, быстрое и удобное.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Smartphone className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">PWA</h3>
                  <p className="text-sm text-muted-foreground">
                    Установи на телефон как обычное приложение
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Globe className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Офлайн</h3>
                  <p className="text-sm text-muted-foreground">
                    Работает даже без интернета
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Zap className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Быстрый ввод</h3>
                  <p className="text-sm text-muted-foreground">
                    Добавляй операции одной командой
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Shield className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Безопасность</h3>
                  <p className="text-sm text-muted-foreground">
                    Твои данные защищены шифрованием
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Как установить</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Нажми на иконку &ldquo;Поделиться&rdquo; в браузере</li>
                <li>Выбери &ldquo;Добавить на главный экран&rdquo;</li>
                <li>Подтверди установку</li>
                <li>Готово! Приложение на твоём устройстве</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Технологии</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'Next.js 16',
                'React 19',
                'TypeScript',
                'Prisma',
                'MySQL',
                'Tailwind CSS',
                'Zustand',
                'React Query',
                'Express',
              ].map((tech) => (
                <div
                  key={tech}
                  className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-center"
                >
                  {tech}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}