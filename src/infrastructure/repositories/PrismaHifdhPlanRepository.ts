import { PrismaClient } from '@prisma/client';
import { IHifdhPlanRepository, HifdhPlanRecord } from '@/application/ports/IHifdhPlanRepository';
import { HifdhConfigInput } from '@/domain/services/DailyPlanGenerator';

function toDomain(row: any): HifdhPlanRecord {
  const cfg = row.config;
  const config: HifdhConfigInput = {
    newPagesPerDay: cfg.newPagesPerDay,
    maxSabqiPages: cfg.maxSabqiPages,
    maxManzilPages: cfg.maxManzilPages,
    studyDays: cfg.studyDays,
    restDays: cfg.restDays,
    weeklyReviewDay: cfg.weeklyReviewDay,
    pauseSabaqThreshold: cfg.pauseSabaqThreshold,
    minimumMasteryToAdvance: cfg.minimumMasteryToAdvance,
  };

  return {
    id: row.id,
    studentId: row.studentId,
    name: row.name,
    status: row.status,
    goalJuzStart: row.goalJuzStart,
    goalJuzEnd: row.goalJuzEnd,
    goalPageStart: row.goalPageStart,
    goalPageEnd: row.goalPageEnd,
    startDate: row.startDate,
    targetEndDate: row.targetEndDate,
    actualEndDate: row.actualEndDate,
    config,
  };
}

export class PrismaHifdhPlanRepository implements IHifdhPlanRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<HifdhPlanRecord | null> {
    const row = await this.db.hifdhPlan.findUnique({
      where: { id },
      include: { config: true },
    });
    if (!row || !row.config) return null;
    return toDomain({ ...row, config: row.config });
  }

  async findActiveByStudentId(studentId: string): Promise<HifdhPlanRecord | null> {
    const row = await this.db.hifdhPlan.findFirst({
      where: { studentId, status: 'ACTIVE' },
      include: { config: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!row || !row.config) return null;
    return toDomain({ ...row, config: row.config });
  }

  async create(plan: Omit<HifdhPlanRecord, 'id'>): Promise<HifdhPlanRecord> {
    const row = await this.db.hifdhPlan.create({
      data: {
        studentId: plan.studentId,
        name: plan.name,
        status: plan.status as any,
        goalJuzStart: plan.goalJuzStart,
        goalJuzEnd: plan.goalJuzEnd,
        goalPageStart: plan.goalPageStart,
        goalPageEnd: plan.goalPageEnd,
        startDate: plan.startDate,
        targetEndDate: plan.targetEndDate,
        actualEndDate: plan.actualEndDate,
        config: {
          create: {
            newPagesPerDay: plan.config.newPagesPerDay,
            maxSabqiPages: plan.config.maxSabqiPages,
            maxManzilPages: plan.config.maxManzilPages,
            studyDays: plan.config.studyDays,
            restDays: plan.config.restDays,
            weeklyReviewDay: plan.config.weeklyReviewDay,
            pauseSabaqThreshold: plan.config.pauseSabaqThreshold,
            minimumMasteryToAdvance: plan.config.minimumMasteryToAdvance,
          },
        },
      },
      include: { config: true },
    });
    return toDomain({ ...row, config: row.config });
  }

  async updateConfig(planId: string, config: HifdhConfigInput): Promise<void> {
    await this.db.hifdhConfig.update({
      where: { planId },
      data: {
        newPagesPerDay: config.newPagesPerDay,
        maxSabqiPages: config.maxSabqiPages,
        maxManzilPages: config.maxManzilPages,
        studyDays: config.studyDays,
        restDays: config.restDays,
        weeklyReviewDay: config.weeklyReviewDay,
        pauseSabaqThreshold: config.pauseSabaqThreshold,
        minimumMasteryToAdvance: config.minimumMasteryToAdvance,
      },
    });
  }
}
