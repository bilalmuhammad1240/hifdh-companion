import { MUSHAF_PAGES } from '@/infrastructure/data/generateMushafPages';
import { getJuzPageRange } from '@/infrastructure/data/mushafConstants';
import { createNewPageMastery, PageMastery } from '@/domain/entities/PageMastery';
import { IHifdhPlanRepository, HifdhPlanRecord } from '../../ports/IHifdhPlanRepository';
import { IPageProgressRepository } from '../../ports/IPageProgressRepository';

export interface CreateHifdhPlanInput {
  studentId: string;
  goalJuzStart: number; // 1
  goalJuzEnd: number; // ex: 30 para Quran completo, ou menor para metas parciais
  newPagesPerDay: number;
  studyDays: number[]; // 1=Dom..7=Sáb
  startDate: Date;
  targetEndDate?: Date; // se omitido, é calculado automaticamente
}

export interface CreateHifdhPlanOutput {
  plan: HifdhPlanRecord;
  projection: {
    totalPages: number;
    daysToComplete: number;
    estimatedEndDate: Date;
  };
}

export class CreateHifdhPlanUseCase {
  constructor(
    private readonly planRepo: IHifdhPlanRepository,
    private readonly pageRepo: IPageProgressRepository
  ) {}

  async execute(input: CreateHifdhPlanInput): Promise<CreateHifdhPlanOutput> {
    const { start: goalPageStart } = getJuzPageRange(input.goalJuzStart);
    const { end: goalPageEnd } = getJuzPageRange(input.goalJuzEnd);
    const totalPages = goalPageEnd - goalPageStart + 1;

    const studyDaysPerWeek = input.studyDays.length || 5;
    const effectiveDailyPages = Math.max(0.1, input.newPagesPerDay);
    // Dias corridos necessários considerando apenas os dias de estudo configurados
    const studyDaysNeeded = Math.ceil(totalPages / effectiveDailyPages);
    const weeksNeeded = Math.ceil(studyDaysNeeded / studyDaysPerWeek);
    const calendarDaysNeeded = weeksNeeded * 7;

    const estimatedEndDate =
      input.targetEndDate ??
      (() => {
        const d = new Date(input.startDate);
        d.setDate(d.getDate() + calendarDaysNeeded);
        return d;
      })();

    const restDays = [1, 2, 3, 4, 5, 6, 7].filter((d) => !input.studyDays.includes(d));

    const plan = await this.planRepo.create({
      studentId: input.studentId,
      name: 'Meu Plano de Hifdh',
      status: 'ACTIVE',
      goalJuzStart: input.goalJuzStart,
      goalJuzEnd: input.goalJuzEnd,
      goalPageStart,
      goalPageEnd,
      startDate: input.startDate,
      targetEndDate: estimatedEndDate,
      actualEndDate: null,
      config: {
        newPagesPerDay: input.newPagesPerDay,
        maxSabqiPages: 10,
        maxManzilPages: 20,
        studyDays: input.studyDays,
        restDays,
        weeklyReviewDay: restDays[0] ?? 1,
        pauseSabaqThreshold: 0.3,
        minimumMasteryToAdvance: 3,
      },
    });

    // Cria os registros PageProgress (estado NOT_STARTED) para todas as
    // páginas dentro da meta, a partir dos dados estáticos do Mushaf.
    const pagesInRange = MUSHAF_PAGES.filter(
      (p) => p.pageNumber >= goalPageStart && p.pageNumber <= goalPageEnd
    );

    const pageEntities: PageMastery[] = pagesInRange.map((mp) =>
      createNewPageMastery({
        id: `${plan.id}-${mp.pageNumber}`,
        planId: plan.id,
        pageNumber: mp.pageNumber,
        juzNumber: mp.juzNumber,
        hizbNumber: mp.hizbNumber,
        rubNumber: mp.rubNumber,
        surahStart: mp.surahStart,
        ayahStart: mp.ayahStart,
        surahEnd: mp.surahEnd,
        ayahEnd: mp.ayahEnd,
        isMutashabih: mp.isMutashabih,
      })
    );

    await this.pageRepo.saveMany(pageEntities);

    return {
      plan,
      projection: {
        totalPages,
        daysToComplete: calendarDaysNeeded,
        estimatedEndDate,
      },
    };
  }
}
