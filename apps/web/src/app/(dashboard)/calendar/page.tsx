'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Calendar } from '@/components/calendar/calendar';
import { DailyDetails } from '@/components/calendar/daily-details';

export default function CalendarPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-6xl pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Календарь</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Calendar
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
          />
          <DailyDetails date={selectedDate} />
        </div>
      </div>
    </div>
  );
}