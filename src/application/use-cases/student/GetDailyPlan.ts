import { DailyPlanGenerator } from '@/domain/services/DailyPlanGenerator';
import { IPageProgressRepository } from '../../ports/IPageProgressRepository';
import { IHifdhPlanRepository } from '../../ports/IHifdhPlanRepository';
import { IDailyPlanRepository, DailyPlanRecord } from '../../ports/IDailyPlanRepository';

export interface GetDailyPlanInput {
  planId: string;
  date: Date;
}

export class GetDailyPlanUseCase {
  constructor(
    private readonly pageRepo: IPageProgressRepository,
    private readonly planRepo: IHifdhPlanRepository,
    private readonly dailyPlanRepo: IDailyPlanRepository
  ) {}

  async execute(input: GetDailyPlanInput): Promise<DailyPlanRecord> {
    const normalizedDate = new Date(
      input.date.getFullYear(),
      input.date.getMonth(),
      input.date.getDate()
    );

    // Plano diário já gerado e cacheado para esta data? Retorna direto.
    const existing = await this.dailyPlanRepo.findByPlanAndDate(input.planId, normalizedDate);
    if (existing) return existing;

    const plan = await this.planRepo.findById(input.planId);
    if (!plan) {
      throw new Error(`Plano de Hifdh não encontrado: ${input.planId}`);
    }

    const allPages = await this.pageRepo.findAllByPlanId(input.planId);

    const result = DailyPlanGenerator.generate(allPages, normalizedDate, plan.config);

    return this.dailyPlanRepo.save(input.planId, normalizedDate, result);
  }
}
