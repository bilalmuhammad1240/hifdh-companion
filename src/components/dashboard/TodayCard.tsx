'use client';

import Link from 'next/link';
import { BookOpen, RotateCcw, Library, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface TodayCardData {
  sabaq: { pagesCount: number; isBlocked: boolean; blockReason: string | null };
  sabqi: { pagesCount: number };
  manzil: { pagesCount: number; juzBeingReviewed: number | null };
  explanation: string;
  isRestDay: boolean;
  isWeeklyReviewDay: boolean;
  totalEstimatedMinutes: number;
}

interface TodayCardProps {
  plan: TodayCardData;
  studyHref: string;
}

export function TodayCard({ plan, studyHref }: TodayCardProps) {
  if (plan.isRestDay) {
    return (
      <Card className="bg-surface-alt">
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-lg font-semibold text-text-primary">Dia de descanso 🌙</p>
          <p className="text-sm text-text-secondary">{plan.explanation}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-5">
        {plan.sabaq.isBlocked && plan.sabaq.blockReason && (
          <div className="flex items-start gap-2 rounded-xl bg-mastery-2/40 p-3 text-sm text-orange-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{plan.sabaq.blockReason}</p>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <PlanRow
            icon={<BookOpen className="h-4 w-4" aria-hidden="true" />}
            label="Sabaq"
            value={plan.sabaq.isBlocked ? 'Pausado' : `${plan.sabaq.pagesCount} página(s)`}
            muted={plan.sabaq.isBlocked}
          />
          <PlanRow
            icon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
            label="Sabqi"
            value={`${plan.sabqi.pagesCount} página(s)`}
          />
          <PlanRow
            icon={<Library className="h-4 w-4" aria-hidden="true" />}
            label="Manzil"
            value={
              plan.manzil.juzBeingReviewed
                ? `${plan.manzil.pagesCount} página(s) — Juz' ${plan.manzil.juzBeingReviewed}`
                : `${plan.manzil.pagesCount} página(s)`
            }
          />
        </div>

        <p className="text-sm leading-relaxed text-text-secondary">{plan.explanation}</p>

        <Button asChild size="lg" className="mt-1 w-full">
          <Link href={studyHref}>Estudar agora</Link>
        </Button>

        {plan.totalEstimatedMinutes > 0 && (
          <p className="text-center text-xs text-text-muted">
            Aproximadamente {plan.totalEstimatedMinutes} minutos
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function PlanRow({
  icon,
  label,
  value,
  muted,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-alt px-3 py-2.5">
      <div className="flex items-center gap-2 text-text-primary">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className={muted ? 'text-sm text-text-muted' : 'text-sm font-mono text-text-secondary'}>
        {value}
      </span>
    </div>
  );
}
