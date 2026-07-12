export interface Theme {
  id: string;
  name: string;
  gradient: string;
  primaryColor: string;
  description: string;
}

export interface BackgroundPattern {
  id: string;
  name: string;
  background: string;
  backgroundSize?: string;
  description: string;
}

export const themes: Theme[] = [
  {
    id: 'purple',
    name: 'Фиолетовый',
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    primaryColor: '#8b5cf6',
    description: 'Классический фиолетовый градиент',
  },
  {
    id: 'blue',
    name: 'Синий',
    gradient: 'from-blue-600 via-cyan-600 to-teal-600',
    primaryColor: '#3b82f6',
    description: 'Свежий синий градиент',
  },
  {
    id: 'green',
    name: 'Зелёный',
    gradient: 'from-emerald-600 via-green-600 to-teal-600',
    primaryColor: '#10b981',
    description: 'Природный зелёный градиент',
  },
  {
    id: 'orange',
    name: 'Оранжевый',
    gradient: 'from-orange-600 via-amber-600 to-yellow-600',
    primaryColor: '#f59e0b',
    description: 'Тёплый оранжевый градиент',
  },
  {
    id: 'red',
    name: 'Красный',
    gradient: 'from-red-600 via-rose-600 to-pink-600',
    primaryColor: '#ef4444',
    description: 'Энергичный красный градиент',
  },
  {
    id: 'dark',
    name: 'Тёмный',
    gradient: 'from-gray-900 via-slate-900 to-zinc-900',
    primaryColor: '#1f2937',
    description: 'Стильный тёмный градиент',
  },
  {
    id: 'ocean',
    name: 'Океан',
    gradient: 'from-blue-700 via-indigo-700 to-purple-800',
    primaryColor: '#1e40af',
    description: 'Глубокий океанский градиент',
  },
  {
    id: 'sunset',
    name: 'Закат',
    gradient: 'from-orange-500 via-pink-500 to-purple-600',
    primaryColor: '#f97316',
    description: 'Романтичный закат',
  },
];

export const backgroundPatterns: BackgroundPattern[] = [
  {
    id: 'gradient-dots',
    name: 'Разноцветные точки',
    background: `radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                 radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
                 radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 40%),
                 radial-gradient(circle at 60% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 40%)`,
    description: 'Мягкие разноцветные круги',
  },
  {
    id: 'geometric',
    name: 'Геометрия',
    background: `linear-gradient(30deg, rgba(139, 92, 246, 0.05) 12%, transparent 12.5%, transparent 87%, rgba(139, 92, 246, 0.05) 87.5%, rgba(139, 92, 246, 0.05)),
                 linear-gradient(150deg, rgba(236, 72, 153, 0.05) 12%, transparent 12.5%, transparent 87%, rgba(236, 72, 153, 0.05) 87.5%, rgba(236, 72, 153, 0.05)),
                 linear-gradient(30deg, rgba(59, 130, 246, 0.05) 12%, transparent 12.5%, transparent 87%, rgba(59, 130, 246, 0.05) 87.5%, rgba(59, 130, 246, 0.05)),
                 linear-gradient(150deg, rgba(16, 185, 129, 0.05) 12%, transparent 12.5%, transparent 87%, rgba(16, 185, 129, 0.05) 87.5%, rgba(16, 185, 129, 0.05))`,
    backgroundSize: '80px 80px',
    description: 'Геометрические шестиугольники',
  },
  {
    id: 'waves',
    name: 'Волны',
    background: `repeating-linear-gradient(
      45deg,
      rgba(139, 92, 246, 0.08),
      rgba(139, 92, 246, 0.08) 10px,
      rgba(236, 72, 153, 0.08) 10px,
      rgba(236, 72, 153, 0.08) 20px,
      rgba(59, 130, 246, 0.08) 20px,
      rgba(59, 130, 246, 0.08) 30px
    )`,
    description: 'Разноцветные диагональные волны',
  },
  {
    id: 'bubbles',
    name: 'Пузыри',
    background: `radial-gradient(circle at 15% 25%, rgba(139, 92, 246, 0.2) 0%, transparent 25%),
                 radial-gradient(circle at 85% 45%, rgba(236, 72, 153, 0.2) 0%, transparent 30%),
                 radial-gradient(circle at 35% 75%, rgba(59, 130, 246, 0.2) 0%, transparent 35%),
                 radial-gradient(circle at 65% 15%, rgba(16, 185, 129, 0.2) 0%, transparent 25%),
                 radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.15) 0%, transparent 30%)`,
    description: 'Большие разноцветные пузыри',
  },
  {
    id: 'mesh',
    name: 'Градиентная сетка',
    background: `linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                 linear-gradient(225deg, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
                 linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                 linear-gradient(315deg, rgba(16, 185, 129, 0.1) 0%, transparent 50%)`,
    description: 'Сложная градиентная сетка',
  },
  {
    id: 'stripes-color',
    name: 'Цветные полосы',
    background: `repeating-linear-gradient(
      90deg,
      rgba(139, 92, 246, 0.08),
      rgba(139, 92, 246, 0.08) 20px,
      rgba(236, 72, 153, 0.08) 20px,
      rgba(236, 72, 153, 0.08) 40px,
      rgba(59, 130, 246, 0.08) 40px,
      rgba(59, 130, 246, 0.08) 60px,
      rgba(16, 185, 129, 0.08) 60px,
      rgba(16, 185, 129, 0.08) 80px
    )`,
    description: 'Вертикальные цветные полосы',
  },
  {
    id: 'circles-concentric',
    name: 'Концентрические круги',
    background: `radial-gradient(circle at 25% 35%, rgba(139, 92, 246, 0.1) 0%, transparent 20%),
                 radial-gradient(circle at 25% 35%, rgba(236, 72, 153, 0.1) 20%, transparent 40%),
                 radial-gradient(circle at 25% 35%, rgba(59, 130, 246, 0.1) 40%, transparent 60%),
                 radial-gradient(circle at 75% 65%, rgba(16, 185, 129, 0.1) 0%, transparent 25%),
                 radial-gradient(circle at 75% 65%, rgba(251, 191, 36, 0.1) 25%, transparent 45%)`,
    description: 'Концентрические разноцветные круги',
  },
  {
    id: 'diamond',
    name: 'Ромбы',
    background: `linear-gradient(45deg, rgba(139, 92, 246, 0.08) 25%, transparent 25%),
                 linear-gradient(-45deg, rgba(236, 72, 153, 0.08) 25%, transparent 25%),
                 linear-gradient(45deg, transparent 75%, rgba(59, 130, 246, 0.08) 75%),
                 linear-gradient(-45deg, transparent 75%, rgba(16, 185, 129, 0.08) 75%)`,
    backgroundSize: '60px 60px',
    description: 'Узор из ромбов',
  },
  {
    id: 'stars',
    name: 'Звёзды',
    background: `radial-gradient(circle at 20% 30%, rgba(251, 191, 36, 0.15) 0%, transparent 10%),
                 radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 12%),
                 radial-gradient(circle at 40% 70%, rgba(236, 72, 153, 0.15) 0%, transparent 8%),
                 radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 10%),
                 radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 15%)`,
    description: 'Разноцветные звёзды',
  },
  {
    id: 'minimal',
    name: 'Минимализм',
    background: 'transparent',
    description: 'Чистый фон без узоров',
  },
];

export function getThemeById(id: string): Theme {
  return themes.find((t) => t.id === id) || themes[0];
}

export function getBackgroundPatternById(id: string): BackgroundPattern {
  return backgroundPatterns.find((p) => p.id === id) || backgroundPatterns[0];
}