import { PageMastery, PageStatus, TeacherRating } from '../entities/PageMastery';
import { ReviewGrade } from '../value-objects/ReviewGrade';

export interface ReviewPerformance {
  errorCount: number;
  recitationSeconds?: number;
}

export interface SM2Result {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  masteryLevel: number;
  status: PageStatus;
  nextReviewDue: Date;
}

/**
 * SM2Algorithm — Algoritmo de repetição espaçada SuperMemo-2, adaptado
 * ao contexto de Hifdh conforme especificado na arquitetura aprovada.
 *
 * Diferente do uso original em flashcards, aqui a "nota" pode vir tanto
 * da auto-avaliação do aluno (contagem de erros) quanto, com prioridade,
 * da avaliação do professor (Excelente/Bom/Aceitável/Repetir/Refazer/Recomeçar).
 */
export class SM2Algorithm {
  static readonly MIN_EASE_FACTOR = 1.3;
  static readonly DEFAULT_EASE_FACTOR = 2.5;

  /** Converte a avaliação do professor para uma nota SM-2 (0-5). */
  static teacherRatingToGrade(rating: TeacherRating): ReviewGrade {
    switch (rating) {
      case TeacherRating.EXCELLENT:
        return ReviewGrade.create(5);
      case TeacherRating.GOOD:
        return ReviewGrade.create(4);
      case TeacherRating.ACCEPTABLE:
        return ReviewGrade.create(3);
      case TeacherRating.REPEAT_TOMORROW:
        return ReviewGrade.create(2);
      case TeacherRating.REDO:
        return ReviewGrade.create(1);
      case TeacherRating.RESTART:
        return ReviewGrade.create(0);
    }
  }

  static masteryLevelToStatus(masteryLevel: number, intervalDays: number): PageStatus {
    if (masteryLevel === 0) return PageStatus.NOT_STARTED;
    if (masteryLevel === 1) return PageStatus.NEW;
    if (masteryLevel === 2) return PageStatus.LEARNING;
    if (masteryLevel === 3) return PageStatus.DEVELOPING;
    if (masteryLevel === 4) return PageStatus.GOOD;
    return PageStatus.EXCELLENT;
  }

  /**
   * Processa uma revisão e retorna o novo estado SM-2 da página.
   * `teacherRating`, quando presente, tem prioridade sobre a auto-avaliação.
   */
  static processReview(
    page: PageMastery,
    performance: ReviewPerformance,
    teacherRating: TeacherRating | null,
    today: Date = new Date()
  ): SM2Result {
    const grade = teacherRating
      ? SM2Algorithm.teacherRatingToGrade(teacherRating)
      : ReviewGrade.fromErrorCount(performance.errorCount);

    const gradeValue = grade.toNumber();

    let { easeFactor, intervalDays, repetitions, masteryLevel } = page;

    // Recomeçar (RESTART) — reset total, independente da nota numérica
    if (teacherRating === TeacherRating.RESTART) {
      easeFactor = SM2Algorithm.DEFAULT_EASE_FACTOR;
      intervalDays = 1;
      repetitions = 0;
      masteryLevel = 1;
    } else if (grade.isPassing()) {
      // Revisão bem-sucedida (nota >= 3)
      if (repetitions === 0) {
        intervalDays = 1;
      } else if (repetitions === 1) {
        intervalDays = 6;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor);
      }
      repetitions += 1;
      masteryLevel = Math.min(5, masteryLevel + (gradeValue >= 4 ? 1 : 0));
    } else {
      // Revisão falhou (nota < 3)
      repetitions = 0;
      intervalDays = 1;
      masteryLevel = Math.max(0, masteryLevel - (gradeValue === 0 ? 2 : 1));
    }

    // Ajuste do Ease Factor (fórmula padrão SM-2)
    easeFactor =
      easeFactor + (0.1 - (5 - gradeValue) * (0.08 + (5 - gradeValue) * 0.02));
    easeFactor = Math.max(SM2Algorithm.MIN_EASE_FACTOR, easeFactor);

    const status = SM2Algorithm.masteryLevelToStatus(masteryLevel, intervalDays);
    const nextReviewDue = new Date(today);
    nextReviewDue.setDate(nextReviewDue.getDate() + intervalDays);

    return { easeFactor, intervalDays, repetitions, masteryLevel, status, nextReviewDue };
  }
}
