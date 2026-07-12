'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ru } from 'date-fns/locale';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  comment?: string;
  category?: { name: string; icon?: string };
}

interface DailyData {
  date: string;
  income: number;
  expense: number;
  balance: number;
  transactions: Transaction[];
}

interface CalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export function Calendar({ onDateSelect, selectedDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const { data: dailyData = [] } = useQuery<DailyData[]>({
    queryKey: ['calendar', format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      const response = await api.get('/transactions/by-date-range', {
        params: {
          start: format(monthStart, 'yyyy-MM-dd'),
          end: format(monthEnd, 'yyyy-MM-dd'),
        },
      });
      return response.data.data;
    },
  });

  const getDayData = (date: Date) => {
    return dailyData.find((d) => d.date === format(date, 'yyyy-MM-dd'));
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          {format(currentMonth, 'LLLL yyyy', { locale: ru })}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayData = getDayData(day);
            const hasData = !!dayData;
            const isCurrentDay = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonthDay = isSameMonth(day, currentMonth);

            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateSelect(day)}
                className={`
                  relative p-2 rounded-lg text-sm transition-all min-h-[60px] flex flex-col
                  ${!isCurrentMonthDay ? 'opacity-30' : ''}
                  ${isSelected ? 'bg-primary text-primary-foreground ring-2 ring-primary' : ''}
                  ${!isSelected && isCurrentDay ? 'bg-muted font-semibold' : ''}
                  ${!isSelected && !isCurrentDay ? 'hover:bg-muted/50' : ''}
                `}
              >
                <span className="text-xs font-medium">{format(day, 'd')}</span>
                {hasData && (
                  <div className="mt-auto space-y-0.5">
                    {dayData.income > 0 && (
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        +{formatCurrency(dayData.income).replace('PLN', '').trim()}
                      </div>
                    )}
                    {dayData.expense > 0 && (
                      <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                        -{formatCurrency(dayData.expense).replace('PLN', '').trim()}
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}