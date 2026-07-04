import { DailyPlanResult } from '@/domain/services/DailyPlanGenerator';

export interface DailyPlanRecord extends DailyPlanResult {
  id: string;
  planId: string;
}

export interface IDailyPlanRepository {
  findByPlanAndDate(planId: string, date: Date): Promise<DailyPlanRecord | null>;
  save(planId: string, date: Date, result: DailyPlanResult): Promise<DailyPlanRecord>;
}
