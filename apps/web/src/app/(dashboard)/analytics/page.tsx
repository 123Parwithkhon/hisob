'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { MonthlyChart } from '@/components/analytics/monthly-chart';
import { Insights } from '@/components/analytics/insights';

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-6xl pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Аналитика</h1>
        </div>

        <MonthlyChart />
        <Insights />
      </div>
    </div>
  );
}