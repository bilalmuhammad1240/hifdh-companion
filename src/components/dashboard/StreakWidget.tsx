import { Flame } from 'lucide-react';
import { ProgressBar } from '@/components/ui/progress-bar';

interface StreakWidgetProps {
  currentStreak: number;
  dailyGoalPercentage: number;
}

export function StreakWidget({ currentStreak, dailyGoalPercentage }: StreakWidgetProps) {
  return (
    <div className="rounded-2xl bg-accent-light p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-gold" aria-hidden="true" />
          <span className="text-sm font-semibold text-text-primary">
            {currentStreak} {currentStreak === 1 ? 'dia seguido' : 'dias seguidos'}
          </span>
        </div>
        <span className="text-sm font-mono text-text-secondary">{Math.round(dailyGoalPercentage)}%</span>
      </div>
      <ProgressBar value={dailyGoalPercentage} className="mt-3" />
    </div>
  );
}
