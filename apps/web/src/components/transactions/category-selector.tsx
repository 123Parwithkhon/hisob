'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCategoriesByType, type Category } from '@/services/categories';
import { cn } from '@/lib/utils';

interface CategorySelectorProps {
  type: 'INCOME' | 'EXPENSE';
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function CategorySelector({ type, selectedId, onSelect }: CategorySelectorProps) {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories', type],
    queryFn: () => fetchCategoriesByType(type),
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Загрузка...</div>;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Категория</label>
      <div className="grid grid-cols-3 gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={cn(
              'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-sm',
              selectedId === category.id
                ? 'border-primary bg-primary/5'
                : 'border-transparent bg-muted/50 hover:bg-muted'
            )}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: category.color || '#6b7280' }}
            >
              {category.name.charAt(0)}
            </div>
            <span className="text-xs text-center truncate w-full">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}