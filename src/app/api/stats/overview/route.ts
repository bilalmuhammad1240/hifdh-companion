import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/container';
import { ProgressCalculator } from '@/domain/services/ProgressCalculator';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const planId = searchParams.get('planId');
  if (!planId) return NextResponse.json({ error: 'planId required' }, { status: 400 });

  const plan = await container.repositories.hifdhPlan.findById(planId);
  if (!plan) return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });

  const pages = await container.repositories.pageProgress.findAllByPlanId(planId);

  const snapshot = ProgressCalculator.calculate(
    pages,
    plan.goalPageStart,
    plan.goalPageEnd,
    plan.startDate,
    plan.targetEndDate,
    new Date(),
    plan.config.newPagesPerDay
  );

  return NextResponse.json({
    ...snapshot,
    projectedEndDate: snapshot.projectedEndDate?.toISOString() ?? null,
    currentStreak: 0,   // TODO: compute from StudySession records
    longestStreak: 0,
  });
}
