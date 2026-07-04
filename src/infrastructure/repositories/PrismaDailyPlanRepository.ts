import { PrismaClient } from '@prisma/client';
import { IDailyPlanRepository, DailyPlanRecord } from '@/application/ports/IDailyPlanRepository';
import { DailyPlanResult } from '@/domain/services/DailyPlanGenerator';

function toDomain(row: any): DailyPlanRecord {
  return {
    id: row.id,
    planId: row.planId,
    date: row.date,
    sabaq: {
      pages: row.sabaqPages,
      pagesCount: row.sabaqPages.length,
      estimatedMinutes: Math.round(row.estimatedMinutes * (row.sabaqPages.length /
        Math.max(1, row.sabaqPages.length + row.sabqiPages.length + row.manzilPages.length))),
      isBlocked: row.isSabaqBlocked,
      blockReason: row.isSabaqBlocked ? row.explanation : null,
    },
    sabqi: {
      pages: row.sabqiPages,
      pagesCount: row.sabqiPages.length,
      estimatedMinutes: 0,
    },
    manzil: {
      pages: row.manzilPages,
      pagesCount: row.manzilPages.length,
      estimatedMinutes: 0,
      juzBeingReviewed: null,
    },
    urgentReview: row.urgentPages,
    isWeeklyReviewDay: row.isWeeklyReview,
    isMonthlyReviewDay: row.isMonthlyReview,
    isRestDay: row.isRestDay,
    explanation: row.explanation,
    warnings: row.warnings,
    totalEstimatedMinutes: row.estimatedMinutes,
  };
}

export class PrismaDailyPlanRepository implements IDailyPlanRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByPlanAndDate(planId: string, date: Date): Promise<DailyPlanRecord | null> {
    const row = await this.db.dailyPlan.findUnique({
      where: { planId_date: { planId, date } },
    });
    return row ? toDomain(row) : null;
  }

  async save(planId: string, date: Date, result: DailyPlanResult): Promise<DailyPlanRecord> {
    const row = await this.db.dailyPlan.upsert({
      where: { planId_date: { planId, date } },
      create: {
        planId,
        date,
        sabaqPages: result.sabaq.pages,
        sabqiPages: result.sabqi.pages,
        manzilPages: result.manzil.pages,
        urgentPages: result.urgentReview,
        isSabaqBlocked: result.sabaq.isBlocked,
        isWeeklyReview: result.isWeeklyReviewDay,
        isMonthlyReview: result.isMonthlyReviewDay,
        isRestDay: result.isRestDay,
        explanation: result.explanation,
        warnings: result.warnings,
        estimatedMinutes: result.totalEstimatedMinutes,
        goalPercentage: 0,
      },
      update: {
        sabaqPages: result.sabaq.pages,
        sabqiPages: result.sabqi.pages,
        manzilPages: result.manzil.pages,
        urgentPages: result.urgentReview,
        isSabaqBlocked: result.sabaq.isBlocked,
        explanation: result.explanation,
        warnings: result.warnings,
        estimatedMinutes: result.totalEstimatedMinutes,
      },
    });
    return toDomain(row);
  }
}
