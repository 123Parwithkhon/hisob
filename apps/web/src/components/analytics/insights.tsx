'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Info, AlertCircle } from 'lucide-react';

interface Insight {
  type: 'positive' | 'warning' | 'info';
  message: string;
}

export function Insights() {
  const { data: insights = [], isLoading } = useQuery<Insight[]>({
    queryKey: ['analytics', 'insights'],
    queryFn: async () => {
      const response = await api.get('/analytics/insights');
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Аналитика</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Аналитика</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Пока нет достаточно данных для аналитики
            </p>
          ) : (
            insights.map((insight, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-xl ${getBgColor(insight.type)}`}
              >
                {getIcon(insight.type)}
                <p className="text-sm flex-1">{insight.message}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}