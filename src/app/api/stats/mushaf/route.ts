import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/container';
import { getJuzPageRange, TOTAL_JUZ } from '@/infrastructure/data/mushafConstants';
import { PageStatus } from '@/domain/entities/PageMastery';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const planId = searchParams.get('planId');
  if (!planId) return NextResponse.json({ error: 'planId required' }, { status: 400 });

  const allPages = await container.repositories.pageProgress.findAllByPlanId(planId);

  const juz = Array.from({ length: TOTAL_JUZ }, (_, i) => {
    const juzNum = i + 1;
    const { start, end } = getJuzPageRange(juzNum);
    const juzPages = allPages.filter((p) => p.pageNumber >= start && p.pageNumber <= end);
    const memorized = juzPages.filter((p) => p.status !== PageStatus.NOT_STARTED);
    const avgMastery = memorized.length > 0
      ? memorized.reduce((s, p) => s + p.masteryLevel, 0) / memorized.length
      : 0;

    return {
      juz: juzNum,
      totalPages: end - start + 1,
      memorizedPages: memorized.length,
      averageMastery: Math.round(avgMastery * 10) / 10,
      pageStatuses: juzPages.map((p) => ({
        pageNumber: p.pageNumber,
        masteryLevel: p.masteryLevel,
        status: p.status,
      })),
    };
  });

  return NextResponse.json({ juz });
}
