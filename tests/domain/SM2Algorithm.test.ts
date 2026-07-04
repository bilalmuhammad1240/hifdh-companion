import { describe, it, expect } from 'vitest';
import { SM2Algorithm } from '../../src/domain/services/SM2Algorithm';
import { createNewPageMastery } from '../../src/domain/entities/PageMastery';
import { TeacherRating } from '../../src/domain/entities/PageMastery';

function makePage(overrides: Partial<ReturnType<typeof createNewPageMastery>> = {}) {
  const base = createNewPageMastery({
    id: 'p1',
    planId: 'plan1',
    pageNumber: 1,
    juzNumber: 1,
    hizbNumber: 1,
    rubNumber: 1,
    surahStart: 1,
    ayahStart: 1,
    surahEnd: 1,
    ayahEnd: 7,
  });
  return { ...base, ...overrides };
}

describe('SM2Algorithm', () => {
  it('first successful review sets interval to 1 day', () => {
    const page = makePage();
    const result = SM2Algorithm.processReview(page, { errorCount: 0 }, null, new Date('2026-01-01'));
    expect(result.intervalDays).toBe(1);
    expect(result.repetitions).toBe(1);
  });

  it('second successful review sets interval to 6 days', () => {
    const page = makePage({ repetitions: 1, intervalDays: 1 });
    const result = SM2Algorithm.processReview(page, { errorCount: 0 }, null, new Date('2026-01-01'));
    expect(result.intervalDays).toBe(6);
  });

  it('subsequent reviews multiply interval by ease factor', () => {
    const page = makePage({ repetitions: 2, intervalDays: 6, easeFactor: 2.5 });
    const result = SM2Algorithm.processReview(page, { errorCount: 0 }, null, new Date('2026-01-01'));
    expect(result.intervalDays).toBeGreaterThanOrEqual(14); // 6 * 2.5 ≈ 15
  });

  it('failed review resets repetitions and interval', () => {
    const page = makePage({ repetitions: 5, intervalDays: 40, masteryLevel: 4 });
    const result = SM2Algorithm.processReview(page, { errorCount: 6 }, null, new Date('2026-01-01'));
    expect(result.repetitions).toBe(0);
    expect(result.intervalDays).toBe(1);
    expect(result.masteryLevel).toBeLessThan(4);
  });

  it('teacher RESTART rating forces full reset regardless of error count', () => {
    const page = makePage({ repetitions: 10, intervalDays: 90, masteryLevel: 5, easeFactor: 2.8 });
    const result = SM2Algorithm.processReview(
      page,
      { errorCount: 0 },
      TeacherRating.RESTART,
      new Date('2026-01-01')
    );
    expect(result.masteryLevel).toBe(1);
    expect(result.intervalDays).toBe(1);
    expect(result.repetitions).toBe(0);
  });

  it('teacher EXCELLENT rating overrides student self-assessment', () => {
    const page = makePage({ repetitions: 1, masteryLevel: 2 });
    const result = SM2Algorithm.processReview(
      page,
      { errorCount: 5 }, // aluno reportaria nota baixa
      TeacherRating.EXCELLENT, // professor discorda e avalia como excelente
      new Date('2026-01-01')
    );
    expect(result.masteryLevel).toBeGreaterThan(2);
  });

  it('ease factor never drops below 1.3', () => {
    let page = makePage({ easeFactor: 1.35 });
    for (let i = 0; i < 5; i++) {
      const result = SM2Algorithm.processReview(page, { errorCount: 10 }, null, new Date('2026-01-01'));
      page = { ...page, ...result } as any;
    }
    expect(page.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('masteryLevelToStatus maps levels correctly', () => {
    expect(SM2Algorithm.masteryLevelToStatus(0, 1)).toBe('NOT_STARTED');
    expect(SM2Algorithm.masteryLevelToStatus(1, 1)).toBe('NEW');
    expect(SM2Algorithm.masteryLevelToStatus(5, 1)).toBe('EXCELLENT');
  });
});
