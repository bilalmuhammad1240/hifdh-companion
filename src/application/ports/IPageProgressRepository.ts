import { PageMastery } from '@/domain/entities/PageMastery';

export interface IPageProgressRepository {
  findAllByPlanId(planId: string): Promise<PageMastery[]>;
  findByPlanAndPageNumber(planId: string, pageNumber: number): Promise<PageMastery | null>;
  save(page: PageMastery): Promise<PageMastery>;
  saveMany(pages: PageMastery[]): Promise<void>;
}
