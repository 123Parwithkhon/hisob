'use client';

import { useState } from 'react';
import { SendHorizontal, Zap } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export function QuickInput() {
  const [command, setCommand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setIsLoading(true);
    try {
      await api.post('/transactions/quick', { command: command.trim() });
      toast.success('Операция добавлена!');
      setCommand('');
      // Обновляем данные на дашборде
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (error: unknown) {
      const message = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка ввода'
        : 'Ошибка ввода';
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <div className="relative flex-1">
        <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="+350 работа | -20 обед | -6 хлеб"
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none transition text-sm"
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !command.trim()}
        className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <SendHorizontal className="h-5 w-5" />
        )}
      </button>
    </form>
  );
}