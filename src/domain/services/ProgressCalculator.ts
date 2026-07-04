import { PageMastery, PageStatus } from '../entities/PageMastery';

export interface ProgressSnapshot {
  totalPagesMemorized: number;
  totalPagesGoal: number;
  percentComplete: number;
  totalJuzCompleted: number;
  averageMasteryLevel: number;
  overallAccuracy: number;
  projectedEndDate: Date | null;
  daysAheadBehind: number;
}

/**
 * ProgressCalculator — Calcula progresso, projeções de conclusão e
 * estatísticas agregadas a partir do estado de PageMastery do plano.
 */
export class ProgressCalculator {
  static calculate(
    allPages: PageMastery[],
    goalPageStart: number,
    goalPageEnd: number,
    startDate: Date,
    targetEndDate: Date,
    today: Date,
    newPagesPerDay: number
  ): ProgressSnapshot {
    const memorized = allPages.filter((p) => p.status !== PageStatus.NOT_STARTED);
    const totalPagesGoal = goalPageEnd - goalPageStart + 1;
    const percentComplete =
      totalPagesGoal > 0 ? (memorized.length / totalPagesGoal) * 100 : 0;

    const juzSet = new Set<number>();
    const juzPageCounts = new Map<number, number>();
    for (const p of allPages) {
      juzPageCounts.set(p.juzNumber, (juzPageCounts.get(p.juzNumber) ?? 0) + 1);
    }
    const juzMemorizedCounts = new Map<number, number>();
    for (const p of memorized) {
      juzMemorizedCounts.set(p.juzNumber, (juzMemorizedCounts.get(p.juzNumber) ?? 0) + 1);
    }
    for (const [juz, total] of juzPageCounts.entries()) {
      const done = juzMemorizedCounts.get(juz) ?? 0;
      if (done >= total) juzSet.add(juz);
    }

    const averageMasteryLevel =
      memorized.length > 0
        ? memorized.reduce((sum, p) => sum + p.masteryLevel, 0) / memorized.length
        : 0;

    const totalReviews = memorized.reduce((sum, p) => sum + p.totalReviews, 0);
    const totalErrors = memorized.reduce((sum, p) => sum + p.totalErrors, 0);
    const overallAccuracy =
      totalReviews > 0 ? ((totalReviews - totalErrors) / totalReviews) * 100 : 100;

    // Projeção: com base no ritmo médio real desde o início, não apenas no configurado
    const daysSinceStart = Math.max(
      1,
      Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    const actualPace = memorized.length / daysSinceStart;
    const effectivePace = actualPace > 0 ? actualPace : newPagesPerDay;
    const remaining = totalPagesGoal - memorized.length;

    let projectedEndDate: Date | null = null;
    if (remaining > 0 && effectivePace > 0) {
      const daysToFinish = Math.ceil(remaining / effectivePace);
      projectedEndDate = new Date(today);
      projectedEndDate.setDate(projectedEndDate.getDate() + daysToFinish);
    } else if (remaining <= 0) {
      projectedEndDate = today;
    }

    const daysAheadBehind = projectedEndDate
      ? Math.round(
          (targetEndDate.getTime() - projectedEndDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    return {
      totalPagesMemorized: memorized.length,
      totalPagesGoal,
      percentComplete: Math.round(percentComplete * 10) / 10,
      totalJuzCompleted: juzSet.size,
      averageMasteryLevel: Math.round(averageMasteryLevel * 10) / 10,
      overallAccuracy: Math.round(overallAccuracy * 10) / 10,
      projectedEndDate,
      daysAheadBehind,
    };
  }
}
