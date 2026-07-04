import { Suspense } from 'react';
import { container } from '@/lib/container';
import { ProgressCalculator } from '@/domain/services/ProgressCalculator';
import { TodayCard } from '@/components/dashboard/TodayCard';
import { StreakWidget } from '@/components/dashboard/StreakWidget';
import { HifdhCalendar } from '@/components/shared/HifdhCalendar';
import { StatRow } from '@/components/dashboard/StatRow';
import { AlertBanner } from '@/components/dashboard/AlertBanner';

// TODO: replace with real auth session
const DEMO_PLAN_ID = process.env.DEMO_PLAN_ID ?? 'demo';

async function DashboardContent() {
  // Try to load real plan — gracefully degrade to demo state
  let dailyPlan = null;
  let stats = null;

  try {
    dailyPlan = await container.useCases.getDailyPlan.execute({
      planId: DEMO_PLAN_ID,
      date: new Date(),
    });

    const pages = await container.repositories.pageProgress.findAllByPlanId(DEMO_PLAN_ID);
    const plan  = await container.repositories.hifdhPlan.findActiveByStudentId('demo');

    if (plan && pages.length > 0) {
      stats = ProgressCalculator.calculate(
        pages,
        plan.goalPageStart,
        plan.goalPageEnd,
        plan.startDate,
        plan.targetEndDate,
        new Date(),
        plan.config.newPagesPerDay
      );
    }
  } catch {
    // No plan yet — show welcome state
  }

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? 'صباح الخير' : greetingHour < 18 ? 'مساء الخير' : 'مساء النور';

  if (!dailyPlan) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <p className="font-arabic text-lg text-text-secondary">{greeting}</p>
          <h1 className="text-2xl font-semibold text-text-primary">Bem-vindo!</h1>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 text-center">
          <p className="text-text-secondary">Você ainda não tem um plano de Hifdh.</p>
          <a
            href="/onboarding"
            className="mt-4 inline-flex h-11 items-center rounded-xl bg-accent px-6 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Criar meu plano
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <p className="font-arabic text-lg text-text-secondary">{greeting}</p>
        <h1 className="text-2xl font-semibold text-text-primary">Sua jornada hoje</h1>
      </div>

      {/* Streak + daily progress */}
      <StreakWidget
        currentStreak={0}
        dailyGoalPercentage={dailyPlan.isRestDay ? 100 : 0}
      />

      {/* Warnings */}
      {dailyPlan.warnings.length > 0 && (
        <div className="flex flex-col gap-2">
          {dailyPlan.warnings.map((w, i) => (
            <AlertBanner key={i} message={w} />
          ))}
        </div>
      )}

      {/* Today's plan card */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
          Plano de hoje
        </h2>
        <TodayCard
          plan={{
            sabaq: dailyPlan.sabaq,
            sabqi: dailyPlan.sabqi,
            manzil: dailyPlan.manzil,
            explanation: dailyPlan.explanation,
            isRestDay: dailyPlan.isRestDay,
            isWeeklyReviewDay: dailyPlan.isWeeklyReviewDay,
            totalEstimatedMinutes: dailyPlan.totalEstimatedMinutes,
          }}
          studyHref="/today"
        />
      </div>

      {/* Progress stats */}
      {stats && (
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
            Progresso geral
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <StatRow label="Páginas" value={String(stats.totalPagesMemorized)} />
            <StatRow label="Juz'" value={String(stats.totalJuzCompleted)} />
            <StatRow label="Concluído" value={`${stats.percentComplete}%`} />
          </div>
        </div>
      )}

      {/* Calendar */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
          Calendário
        </h2>
        <HifdhCalendar planId={DEMO_PLAN_ID} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-16 rounded-2xl bg-surface-alt" />
      <div className="h-32 rounded-2xl bg-surface-alt" />
      <div className="h-48 rounded-2xl bg-surface-alt" />
    </div>
  );
}
