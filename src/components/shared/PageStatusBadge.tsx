import { cn } from '@/lib/utils';

const LEVEL_LABELS: Record<number, string> = {
  0: 'Não memorizada',
  1: 'Nova',
  2: 'Fraca',
  3: 'Regular',
  4: 'Boa',
  5: 'Excelente',
};

const LEVEL_CLASSES: Record<number, string> = {
  0: 'bg-mastery-0 text-text-secondary',
  1: 'bg-mastery-1 text-red-900',
  2: 'bg-mastery-2 text-orange-900',
  3: 'bg-mastery-3 text-amber-900',
  4: 'bg-mastery-4 text-green-900',
  5: 'bg-mastery-5 text-green-950',
};

interface PageStatusBadgeProps {
  masteryLevel: number;
  isForgotten?: boolean;
  className?: string;
}

export function PageStatusBadge({ masteryLevel, isForgotten, className }: PageStatusBadgeProps) {
  if (isForgotten) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-mastery-forgotten px-2.5 py-0.5 text-xs font-medium text-red-900',
          className
        )}
      >
        Esquecida
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        LEVEL_CLASSES[masteryLevel] ?? LEVEL_CLASSES[0],
        className
      )}
    >
      {LEVEL_LABELS[masteryLevel] ?? 'Desconhecido'}
    </span>
  );
}
