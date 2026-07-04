import { describe, it, expect } from 'vitest';
import { DailyPlanGenerator, HifdhConfigInput } from '../../src/domain/services/DailyPlanGenerator';
import { createNewPageMastery, PageStatus } from '../../src/domain/entities/PageMastery';

const baseConfig: HifdhConfigInput = {
  newPagesPerDay: 1,
  maxSabqiPages: 10,
  maxManzilPages: 20,
  studyDays: [2, 3, 4, 5, 6],
  restDays: [1, 7],
  weeklyReviewDay: 1,
  pauseSabaqThreshold: 0.3,
  minimumMasteryToAdvance: 3,
};

function makePages(count: number) {
  return Array.from({ length: count }, (_, i) =>
    createNewPageMastery({
      id: `p${i + 1}`,
      planId: 'plan1',
      pageNumber: i + 1,
      juzNumber: Math.ceil((i + 1) / 20),
      hizbNumber: 1,
      rubNumber: 1,
      surahStart: 1,
      ayahStart: 1,
      surahEnd: 1,
      ayahEnd: 5,
    })
  );
}

describe('DailyPlanGenerator', () => {
  it('returns rest day plan on configured rest days', () => {
    const pages = makePages(10);
    // 2026-01-04 é domingo (dow=1)
    const sunday = new Date('2026-01-04T12:00:00Z');
    const result = DailyPlanGenerator.generate(pages, sunday, { ...baseConfig, restDays: [1] });
    expect(result.isRestDay).toBe(true);
    expect(result.sabaq.pagesCount).toBe(0);
  });

  it('first day with no memorized pages assigns Sabaq from page 1', () => {
    const pages = makePages(10);
    const monday = new Date('2026-01-05T12:00:00Z'); // segunda
    const result = DailyPlanGenerator.generate(pages, monday, baseConfig);
    expect(result.sabaq.pages).toEqual([1]);
    expect(result.sabaq.isBlocked).toBe(false);
  });

  it('blocks Sabaq when forgotten pages exist', () => {
    const pages = makePages(15);
    pages[0]!.status = PageStatus.FORGOTTEN;
    pages[0]!.memorizedAt = new Date('2025-12-01');
    pages[0]!.lastReviewedAt = new Date('2025-12-01');
    const monday = new Date('2026-01-05T12:00:00Z');
    const result = DailyPlanGenerator.generate(pages, monday, baseConfig);
    expect(result.sabaq.isBlocked).toBe(true);
    expect(result.sabaq.blockReason).toContain('esquecid');
  });

  it('weekly review day produces no new Sabaq', () => {
    const pages = makePages(10);
    for (const p of pages) {
      p.status = PageStatus.GOOD;
      p.memorizedAt = new Date('2026-01-01');
      p.lastReviewedAt = new Date('2026-01-01');
    }
    const sunday = new Date('2026-01-04T12:00:00Z');
    const result = DailyPlanGenerator.generate(pages, sunday, {
      ...baseConfig,
      restDays: [7],
      weeklyReviewDay: 1,
    });
    expect(result.isWeeklyReviewDay).toBe(true);
    expect(result.sabaq.pagesCount).toBe(0);
  });

  it('explanation is always a non-empty pedagogical message', () => {
    const pages = makePages(5);
    const monday = new Date('2026-01-05T12:00:00Z');
    const result = DailyPlanGenerator.generate(pages, monday, baseConfig);
    expect(result.explanation.length).toBeGreaterThan(10);
  });
});
