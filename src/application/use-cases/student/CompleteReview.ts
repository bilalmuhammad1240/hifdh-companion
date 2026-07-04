import { SM2Algorithm, ReviewPerformance } from '@/domain/services/SM2Algorithm';
import { TeacherRating, PageStatus, PageCategory } from '@/domain/entities/PageMastery';
import { IPageProgressRepository } from '../../ports/IPageProgressRepository';

export interface CompleteReviewInput {
  planId: string;
  pageNumber: number;
  errorCount: number;
  recitationSeconds?: number;
  teacherRating?: TeacherRating | null;
  studentNotes?: string;
}

export interface CompleteReviewOutput {
  pageNumber: number;
  previousMasteryLevel: number;
  newMasteryLevel: number;
  newStatus: PageStatus;
  nextReviewDue: Date;
}

export class CompleteReviewUseCase {
  constructor(private readonly pageRepo: IPageProgressRepository) {}

  async execute(input: CompleteReviewInput): Promise<CompleteReviewOutput> {
    const page = await this.pageRepo.findByPlanAndPageNumber(input.planId, input.pageNumber);
    if (!page) {
      throw new Error(
        `Página ${input.pageNumber} não encontrada no plano ${input.planId}. ` +
          `Memorize-a primeiro antes de registrar uma revisão.`
      );
    }

    const performance: ReviewPerformance = {
      errorCount: input.errorCount,
      recitationSeconds: input.recitationSeconds,
    };

    const today = new Date();
    const result = SM2Algorithm.processReview(
      page,
      performance,
      input.teacherRating ?? null,
      today
    );

    const updatedPage = {
      ...page,
      easeFactor: result.easeFactor,
      intervalDays: result.intervalDays,
      repetitions: result.repetitions,
      masteryLevel: result.masteryLevel,
      status: result.status,
      nextReviewDue: result.nextReviewDue,
      lastReviewedAt: today,
      totalReviews: page.totalReviews + 1,
      totalErrors: input.errorCount > 0 ? page.totalErrors + 1 : page.totalErrors,
      hasErrors: input.errorCount > 0,
      lastTeacherRating: input.teacherRating ?? page.lastTeacherRating,
      teacherApproved: input.teacherRating
        ? [TeacherRating.EXCELLENT, TeacherRating.GOOD, TeacherRating.ACCEPTABLE].includes(
            input.teacherRating
          )
        : page.teacherApproved,
      studentNotes: input.studentNotes ?? page.studentNotes,
      // Página que estava em Sabqi e atingiu mastery suficiente passa a Manzil
      category:
        result.masteryLevel >= 3 && page.category === PageCategory.SABQI
          ? PageCategory.MANZIL
          : page.category,
    };

    await this.pageRepo.save(updatedPage);

    return {
      pageNumber: input.pageNumber,
      previousMasteryLevel: page.masteryLevel,
      newMasteryLevel: result.masteryLevel,
      newStatus: result.status,
      nextReviewDue: result.nextReviewDue,
    };
  }
}
