import { PrismaClient } from '@prisma/client';
import { IPageProgressRepository } from '@/application/ports/IPageProgressRepository';
import {
  PageMastery,
  PageStatus,
  PageCategory,
  TeacherRating,
} from '@/domain/entities/PageMastery';

/**
 * Mapeia entre o enum de domínio (PageStatus/PageCategory/TeacherRating)
 * e os enums equivalentes gerados pelo Prisma, mantendo o domínio puro
 * desacoplado de detalhes de infraestrutura.
 */
function toDomain(row: any): PageMastery {
  return {
    id: row.id,
    planId: row.planId,
    pageNumber: row.pageNumber,
    juzNumber: row.juzNumber,
    hizbNumber: row.hizbNumber,
    rubNumber: row.rubNumber,
    surahStart: row.surahStart,
    ayahStart: row.ayahStart,
    surahEnd: row.surahEnd,
    ayahEnd: row.ayahEnd,
    status: row.status as PageStatus,
    masteryLevel: row.masteryLevel,
    category: row.category as PageCategory,
    memorizedAt: row.memorizedAt,
    lastReviewedAt: row.lastReviewedAt,
    nextReviewDue: row.nextReviewDue,
    easeFactor: row.easeFactor,
    intervalDays: row.intervalDays,
    repetitions: row.repetitions,
    totalReviews: row.totalReviews,
    totalErrors: row.totalErrors,
    averageRecitationSeconds: row.averageRecitationSeconds,
    teacherApproved: row.teacherApproved,
    lastTeacherRating: (row.lastTeacherRating as TeacherRating) ?? null,
    isMutashabih: row.isMutashabih,
    hasErrors: row.hasErrors,
    studentNotes: row.studentNotes,
    teacherNotes: row.teacherNotes,
  };
}

export class PrismaPageProgressRepository implements IPageProgressRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAllByPlanId(planId: string): Promise<PageMastery[]> {
    const rows = await this.db.pageProgress.findMany({
      where: { planId },
      orderBy: { pageNumber: 'asc' },
    });
    return rows.map(toDomain);
  }

  async findByPlanAndPageNumber(planId: string, pageNumber: number): Promise<PageMastery | null> {
    const row = await this.db.pageProgress.findUnique({
      where: { planId_pageNumber: { planId, pageNumber } },
    });
    return row ? toDomain(row) : null;
  }

  async save(page: PageMastery): Promise<PageMastery> {
    const row = await this.db.pageProgress.upsert({
      where: { planId_pageNumber: { planId: page.planId, pageNumber: page.pageNumber } },
      create: {
        id: page.id,
        planId: page.planId,
        pageNumber: page.pageNumber,
        juzNumber: page.juzNumber,
        hizbNumber: page.hizbNumber,
        rubNumber: page.rubNumber,
        surahStart: page.surahStart,
        ayahStart: page.ayahStart,
        surahEnd: page.surahEnd,
        ayahEnd: page.ayahEnd,
        status: page.status as any,
        masteryLevel: page.masteryLevel,
        category: page.category as any,
        memorizedAt: page.memorizedAt,
        lastReviewedAt: page.lastReviewedAt,
        nextReviewDue: page.nextReviewDue,
        easeFactor: page.easeFactor,
        intervalDays: page.intervalDays,
        repetitions: page.repetitions,
        totalReviews: page.totalReviews,
        totalErrors: page.totalErrors,
        averageRecitationSeconds: page.averageRecitationSeconds,
        teacherApproved: page.teacherApproved,
        lastTeacherRating: page.lastTeacherRating as any,
        isMutashabih: page.isMutashabih,
        hasErrors: page.hasErrors,
        studentNotes: page.studentNotes,
        teacherNotes: page.teacherNotes,
      },
      update: {
        status: page.status as any,
        masteryLevel: page.masteryLevel,
        category: page.category as any,
        memorizedAt: page.memorizedAt,
        lastReviewedAt: page.lastReviewedAt,
        nextReviewDue: page.nextReviewDue,
        easeFactor: page.easeFactor,
        intervalDays: page.intervalDays,
        repetitions: page.repetitions,
        totalReviews: page.totalReviews,
        totalErrors: page.totalErrors,
        averageRecitationSeconds: page.averageRecitationSeconds,
        teacherApproved: page.teacherApproved,
        lastTeacherRating: page.lastTeacherRating as any,
        hasErrors: page.hasErrors,
        studentNotes: page.studentNotes,
        teacherNotes: page.teacherNotes,
      },
    });
    return toDomain(row);
  }

  async saveMany(pages: PageMastery[]): Promise<void> {
    // createMany não suporta upsert; usado apenas na criação inicial do plano
    // (todas as páginas começam NOT_STARTED, então não há conflito).
    await this.db.pageProgress.createMany({
      data: pages.map((page) => ({
        id: page.id,
        planId: page.planId,
        pageNumber: page.pageNumber,
        juzNumber: page.juzNumber,
        hizbNumber: page.hizbNumber,
        rubNumber: page.rubNumber,
        surahStart: page.surahStart,
        ayahStart: page.ayahStart,
        surahEnd: page.surahEnd,
        ayahEnd: page.ayahEnd,
        status: page.status as any,
        masteryLevel: page.masteryLevel,
        category: page.category as any,
        easeFactor: page.easeFactor,
        intervalDays: page.intervalDays,
        repetitions: page.repetitions,
        totalReviews: page.totalReviews,
        totalErrors: page.totalErrors,
        averageRecitationSeconds: page.averageRecitationSeconds,
        teacherApproved: page.teacherApproved,
        isMutashabih: page.isMutashabih,
        hasErrors: page.hasErrors,
      })),
      skipDuplicates: true,
    });
  }
}
