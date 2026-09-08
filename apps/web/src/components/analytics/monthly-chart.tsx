'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function MonthlyChart() {
  const { data: monthlyData, isLoading, error } = useQuery({
    queryKey: ['monthly-trend'],
    queryFn: async () => {
      console.log('📊 [FRONTEND] Fetching monthly-trend...');
      try {
        const response = await api.get('/analytics/monthly-trend');
        console.log('[FRONTEND] Response from monthly-trend:', response.data);
        return response.data.data;
      } catch (err) {
        console.error('[FRONTEND] ❌ Error fetching monthly-trend:', err);
        throw err;
      }
    },
  });

  console.log('[FRONTEND] monthlyData state:', monthlyData);
  console.log('[FRONTEND] isLoading:', isLoading);
  console.log('[FRONTEND] error:', error);

  if (isLoading) {
    console.log('[FRONTEND]  Loading...');
    return (
      <Card>
        <CardHeader>
          <CardTitle>Динамика за полгода</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Загрузка...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('[FRONTEND]  Error in component:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Динамика за полгода</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-red-500">
            Ошибка загрузки данных
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!monthlyData || monthlyData.length === 0) {
    console.log('[FRONTEND] ⚠️ No data to display');
    return (
      <Card>
        <CardHeader>
          <CardTitle>Динамика за полгода</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Пока нет достаточно данных для аналитики
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('[FRONTEND] ✅ Rendering chart with data:', monthlyData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Динамика за полгода</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#22c55e" name="Доход" />
            <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Расход" />
            <Line type="monotone" dataKey="balance" stroke="#3b82f6" name="Баланс" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}