export enum PageStatus {
  NOT_STARTED = 'NOT_STARTED',
  NEW = 'NEW',
  LEARNING = 'LEARNING',
  DEVELOPING = 'DEVELOPING',
  GOOD = 'GOOD',
  EXCELLENT = 'EXCELLENT',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  FORGOTTEN = 'FORGOTTEN',
}

export enum PageCategory {
  NOT_MEMORIZED = 'NOT_MEMORIZED',
  SABAQ = 'SABAQ',
  SABQI = 'SABQI',
  MANZIL = 'MANZIL',
  REVIEW_COMPLETE = 'REVIEW_COMPLETE',
}

export enum TeacherRating {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  ACCEPTABLE = 'ACCEPTABLE',
  REPEAT_TOMORROW = 'REPEAT_TOMORROW',
  REDO = 'REDO',
  RESTART = 'RESTART',
}

/**
 * PageMastery — Entidade de domínio que representa o estado completo
 * de memorização de uma página do Mushaf para um determinado plano.
 *
 * Esta é a unidade central sobre a qual o MuhaffadhEngine raciocina.
 */
export interface PageMastery {
  id: string;
  planId: string;
  pageNumber: number;
  juzNumber: number;
  hizbNumber: number;
  rubNumber: number;
  surahStart: number;
  ayahStart: number;
  surahEnd: number;
  ayahEnd: number;

  status: PageStatus;
  masteryLevel: number; // 0-5
  category: PageCategory;

  memorizedAt: Date | null;
  lastReviewedAt: Date | null;
  nextReviewDue: Date | null;

  easeFactor: number; // 1.3-3.0, inicia 2.5
  intervalDays: number;
  repetitions: number;

  totalReviews: number;
  totalErrors: number;
  averageRecitationSeconds: number;

  teacherApproved: boolean;
  lastTeacherRating: TeacherRating | null;

  isMutashabih: boolean;
  hasErrors: boolean;

  studentNotes: string | null;
  teacherNotes: string | null;
}

export function errorRate(page: PageMastery): number {
  if (page.totalReviews === 0) return 0;
  return page.totalErrors / page.totalReviews;
}

export function createNewPageMastery(params: {
  id: string;
  planId: string;
  pageNumber: number;
  juzNumber: number;
  hizbNumber: number;
  rubNumber: number;
  surahStart: number;
  ayahStart: number;
  surahEnd: number;
  ayahEnd: number;
  isMutashabih?: boolean;
}): PageMastery {
  return {
    id: params.id,
    planId: params.planId,
    pageNumber: params.pageNumber,
    juzNumber: params.juzNumber,
    hizbNumber: params.hizbNumber,
    rubNumber: params.rubNumber,
    surahStart: params.surahStart,
    ayahStart: params.ayahStart,
    surahEnd: params.surahEnd,
    ayahEnd: params.ayahEnd,
    status: PageStatus.NOT_STARTED,
    masteryLevel: 0,
    category: PageCategory.NOT_MEMORIZED,
    memorizedAt: null,
    lastReviewedAt: null,
    nextReviewDue: null,
    easeFactor: 2.5,
    intervalDays: 1,
    repetitions: 0,
    totalReviews: 0,
    totalErrors: 0,
    averageRecitationSeconds: 0,
    teacherApproved: false,
    lastTeacherRating: null,
    isMutashabih: params.isMutashabih ?? false,
    hasErrors: false,
    studentNotes: null,
    teacherNotes: null,
  };
}
