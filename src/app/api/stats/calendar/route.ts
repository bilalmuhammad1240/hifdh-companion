import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const planId = searchParams.get('planId');
  const year   = Number(searchParams.get('year')  ?? new Date().getFullYear());
  const month  = Number(searchParams.get('month') ?? new Date().getMonth() + 1);

  if (!planId) return NextResponse.json({ error: 'planId required' }, { status: 400 });

  const startDate = new Date(year, month - 1, 1);
  const endDate   = new Date(year, month, 0, 23, 59, 59);

  const dailyPlans = await prisma.dailyPlan.findMany({
    where: { planId, date: { gte: startDate, lte: endDate } },
    select: { date: true, completionStatus: true, isRestDay: true },
  });

  const days = dailyPlans.map((dp) => {
    let status: string;
    if (dp.isRestDay)                         status = 'rest';
    else if (dp.completionStatus === 'COMPLETED') status = 'complete';
    else if (dp.completionStatus === 'PARTIAL')   status = 'partial';
    else if (dp.completionStatus === 'MISSED')    status = 'missed';
    else                                          status = 'future';

    return {
      date: dp.date.toISOString().split('T')[0],
      status,
    };
  });

  return NextResponse.json({ days });
}
