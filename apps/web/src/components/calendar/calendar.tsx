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

  // Теперь эта функция используется!
  const getDayData = (date: Date) => {
    return dailyData.find((d) => d.date === format(date, 'yyyy-MM-dd'));
  };

  // Теперь эта функция используется!
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <CalendarIcon className="h-5 w-5 text-primary" />
          {format(currentMonth, 'LLLL yyyy', { locale: ru })}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        {/* Дни недели */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
            <div 
              key={day} 
              className="text-[10px] sm:text-xs font-semibold text-center text-muted-foreground py-1 sm:py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Сетка дней месяца */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayData = getDayData(date);
            const isCurrentDay = isToday(date);
            const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
            
            const hasTransactions = dayData && dayData.transactions.length > 0;
            const balance = dayData ? dayData.balance : 0;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => onDateSelect(date)}
                className={`
                  relative flex flex-col items-center justify-center 
                  aspect-square sm:aspect-auto sm:min-h-[70px] 
                  rounded-lg sm:rounded-xl 
                  text-xs sm:text-sm font-medium 
                  transition-all duration-200 border
                  ${isCurrentDay 
                    ? 'bg-primary text-primary-foreground border-primary font-bold' 
                    : 'hover:bg-muted/50 border-transparent'}
                  ${isSelected && !isCurrentDay ? 'ring-2 ring-primary bg-muted' : ''}
                  ${hasTransactions ? 'ring-1 ring-primary/20' : ''}
                `}
              >
                {/* Число дня */}
                <span className="mb-1">{format(date, 'd')}</span>
                
                {/* Индикатор транзакций */}
                {hasTransactions && (
                  <div className="flex flex-col items-center gap-0.5 w-full px-1">
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                      balance >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    {/* На мобильных скрываем сумму, на ПК показываем */}
                    <span className="hidden sm:block text-[10px] text-muted-foreground truncate w-full text-center">
                      {formatCurrency(balance)}
                    </span>
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