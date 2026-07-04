import { prisma } from './prisma';
import { PrismaPageProgressRepository } from '@/infrastructure/repositories/PrismaPageProgressRepository';
import { PrismaHifdhPlanRepository } from '@/infrastructure/repositories/PrismaHifdhPlanRepository';
import { PrismaDailyPlanRepository } from '@/infrastructure/repositories/PrismaDailyPlanRepository';
import { GetDailyPlanUseCase } from '@/application/use-cases/student/GetDailyPlan';
import { CompleteReviewUseCase } from '@/application/use-cases/student/CompleteReview';
import { MarkPageMemorizedUseCase } from '@/application/use-cases/student/MarkPageMemorized';
import { CreateHifdhPlanUseCase } from '@/application/use-cases/student/CreateHifdhPlan';

const pageProgressRepository = new PrismaPageProgressRepository(prisma);
const hifdhPlanRepository = new PrismaHifdhPlanRepository(prisma);
const dailyPlanRepository = new PrismaDailyPlanRepository(prisma);

export const container = {
  repositories: {
    pageProgress: pageProgressRepository,
    hifdhPlan: hifdhPlanRepository,
    dailyPlan: dailyPlanRepository,
  },
  useCases: {
    getDailyPlan: new GetDailyPlanUseCase(
      pageProgressRepository,
      hifdhPlanRepository,
      dailyPlanRepository
    ),
    completeReview: new CompleteReviewUseCase(pageProgressRepository),
    markPageMemorized: new MarkPageMemorizedUseCase(pageProgressRepository),
    createHifdhPlan: new CreateHifdhPlanUseCase(hifdhPlanRepository, pageProgressRepository),
  },
};
