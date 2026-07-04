import { PageStatus, PageCategory } from '@/domain/entities/PageMastery';
import { IPageProgressRepository } from '../../ports/IPageProgressRepository';

export interface MarkPageMemorizedInput {
  planId: string;
  pageNumber: number;
  difficulty: 'easy' | 'normal' | 'hard';
  studentNotes?: string;
}

export class MarkPageMemorizedUseCase {
  constructor(private readonly pageRepo: IPageProgressRepository) {}

  async execute(input: MarkPageMemorizedInput): Promise<void> {
    const page = await this.pageRepo.findByPlanAndPageNumber(input.planId, input.pageNumber);
    if (!page) {
      throw new Error(`Página ${input.pageNumber} não encontrada no plano ${input.planId}.`);
    }
    if (page.status !== PageStatus.NOT_STARTED) {
      throw new Error(
        `Página ${input.pageNumber} já foi memorizada anteriormente. Use o fluxo de revisão.`
      );
    }

    const today = new Date();
    // Dificuldade reportada pelo aluno influencia o masteryLevel inicial
    const initialMastery = input.difficulty === 'easy' ? 2 : input.difficulty === 'hard' ? 1 : 1;

    await this.pageRepo.save({
      ...page,
      status: PageStatus.NEW,
      category: PageCategory.SABQI,
      masteryLevel: initialMastery,
      memorizedAt: today,
      lastReviewedAt: today,
      nextReviewDue: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      intervalDays: 1,
      repetitions: 0,
      totalReviews: 1,
      studentNotes: input.studentNotes ?? page.studentNotes,
    });
  }
}
