'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Target, Clock, Flame, BookOpen, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';

interface StatsData {
  totalPagesMemorized: number;
  totalPagesGoal: number;
  percentComplete: number;
  totalJuzCompleted: number;
  averageMasteryLevel: number;
  overallAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  projectedEndDate: string | null;
  daysAheadBehind: number;
}

const PLAN_ID = 'demo';

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/stats/overview?planId=${PLAN_ID}`);
        if (res.ok) setStats(await res.json());
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-8 w-32 rounded-xl bg-surface-alt" />
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-surface-alt" />)}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <BookOpen className="h-10 w-10 text-text-muted" />
        <p className="text-text-secondary">Nenhum dado disponível ainda.</p>
        <p className="text-sm text-text-muted">Complete sua primeira sessão de estudo para ver estatísticas.</p>
      </div>
    );
  }

  const projectedDate = stats.projectedEndDate
    ? new Date(stats.projectedEndDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  const scheduleLabel =
    stats.daysAheadBehind > 0 ? `${stats.daysAheadBehind} dias adiantado` :
    stats.daysAheadBehind < 0 ? `${Math.abs(stats.daysAheadBehind)} dias atrasado` :
    'No prazo';

  const scheduleColor =
    stats.daysAheadBehind > 0 ? 'text-day-complete' :
    stats.daysAheadBehind < 0 ? 'text-day-missed' :
    'text-accent';

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold text-text-primary">Estatísticas</h1>

      {/* Main progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Progresso geral</CardTitle>
            <span className="font-mono text-2xl font-bold text-accent">{stats.percentComplete}%</span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <ProgressBar value={stats.percentComplete} />
          <div className="flex justify-between text-xs text-text-muted">
            <span>{stats.totalPagesMemorized} páginas memorizadas</span>
            <span>{stats.totalPagesGoal} páginas no total</span>
          </div>
          {projectedDate && (
            <div className="flex items-center justify-between rounded-xl bg-surface-alt px-3 py-2.5">
              <span className="text-sm text-text-secondary">Conclusão prevista</span>
              <div className="text-right">
                <span className="text-sm font-medium text-text-primary">{projectedDate}</span>
                <span className={`ml-2 text-xs font-medium ${scheduleColor}`}>({scheduleLabel})</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={<Flame className="h-5 w-5 text-gold" />} label="Sequência atual" value={`${stats.currentStreak} dias`} sub={`Recorde: ${stats.longestStreak} dias`} />
        <MetricCard icon={<CheckCircle className="h-5 w-5 text-day-complete" />} label="Precisão geral" value={`${stats.overallAccuracy}%`} sub="Revisões sem erro" />
        <MetricCard icon={<Target className="h-5 w-5 text-accent" />} label="Juz' completos" value={String(stats.totalJuzCompleted)} sub="de 30 Juz'" />
        <MetricCard icon={<TrendingUp className="h-5 w-5 text-accent" />} label="Domínio médio" value={`${stats.averageMasteryLevel}/5`} sub="Nível de mastery" />
      </div>

      {/* Mastery distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de domínio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2.5">
            {[
              { level: 5, label: 'Excelente', color: 'bg-mastery-5' },
              { level: 4, label: 'Boa',       color: 'bg-mastery-4' },
              { level: 3, label: 'Regular',   color: 'bg-mastery-3' },
              { level: 2, label: 'Fraca',     color: 'bg-mastery-2' },
              { level: 1, label: 'Nova',      color: 'bg-mastery-1' },
            ].map(({ level, label, color }) => (
              <div key={level} className="flex items-center gap-3">
                <span className={`h-3 w-3 shrink-0 rounded-sm ${color}`} />
                <span className="w-16 text-xs text-text-secondary">{label}</span>
                <div className="flex-1 rounded-full bg-surface-alt h-2">
                  <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.round(stats.averageMasteryLevel >= level ? 100 : 0)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ icon, label, value, sub }: {
  icon: React.ReactNode; label: string; value: string; sub: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4">
      {icon}
      <div>
        <p className="font-mono text-xl font-bold text-text-primary">{value}</p>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-muted">{sub}</p>
      </div>
    </div>
  );
}
