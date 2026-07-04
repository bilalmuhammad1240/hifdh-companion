import { PageMastery, PageCategory, errorRate } from '../entities/PageMastery';
import { ForgettingCurve } from './ForgettingCurve';

export interface ScoredPage {
  page: PageMastery;
  score: number;
  breakdown: {
    forgettingRisk: number;
    daysOverdue: number;
    errorRateContribution: number;
    masteryContribution: number;
    teacherRatingContribution: number;
    mutashabihContribution: number;
    categoryContribution: number;
  };
}

/**
 * UrgencyScoring — Calcula um "score de urgência" (0-100+) para cada
 * página memorizada, determinando a prioridade de revisão.
 *
 * Pesos calibrados com base na pesquisa verificada de metodologias:
 * - Risco de esquecimento (Ebbinghaus): fator dominante (×40)
 * - Dias além do prazo SM-2: fator importante (×5, cap 30)
 * - Taxa de erro histórica: fator significativo (×25)
 * - Mastery baixo: fator moderado (×8 por nível abaixo do máximo)
 * - Avaliação negativa do professor: fator alto (+20 a +40)
 *   (professor tem autoridade sobre auto-avaliação — princípio verificado)
 * - Mutashabihat: fator de risco adicional (+10)
 * - Categoria SABQI: prioridade sobre MANZIL (+15)
 * - Status FORGOTTEN: máxima urgência (+50)
 *
 * Thresholds de ação (calibrados):
 *   score > 80 → urgentReview (entra no dia independentemente do ciclo Manzil)
 *   score > 60 → conta para pausa automática do Sabaq (threshold: 30% das páginas)
 *   score > 40 → warning ao aluno
 */
export class UrgencyScoring {
  static readonly URGENT_THRESHOLD = 80;
  static readonly SABAQ_PAUSE_THRESHOLD = 60;
  static readonly WARNING_THRESHOLD = 40;

  static calculate(page: PageMastery, today: Date): ScoredPage {
    const daysSinceReview = ForgettingCurve.daysSince(page.lastReviewedAt, today);
    const daysOverdue = Math.max(0, daysSinceReview - page.intervalDays);
    const forgettingRisk = ForgettingCurve.calculateRisk(page, today);
    const rate = errorRate(page);

    const breakdown = {
      forgettingRisk: forgettingRisk * 40,
      daysOverdue: Math.min(daysOverdue * 5, 30),
      errorRateContribution: rate * 25,
      masteryContribution: (5 - page.masteryLevel) * 8,
      teacherRatingContribution: UrgencyScoring.teacherRatingScore(page),
      mutashabihContribution: page.isMutashabih ? 10 : 0,
      categoryContribution: UrgencyScoring.categoryScore(page),
    };

    const score = Object.values(breakdown).reduce((sum, v) => sum + v, 0);

    return { page, score, breakdown };
  }

  private static teacherRatingScore(page: PageMastery): number {
    switch (page.lastTeacherRating) {
      case 'REPEAT_TOMORROW': return 20;
      case 'REDO':            return 20;
      case 'RESTART':         return 40;
      default:                return 0;
    }
  }

  private static categoryScore(page: PageMastery): number {
    if (page.status === 'FORGOTTEN')           return 50;
    if (page.category === PageCategory.SABQI)  return 15;
    return 0;
  }

  static rankPages(pages: PageMastery[], today: Date): ScoredPage[] {
    return pages
      .map((p) => UrgencyScoring.calculate(p, today))
      .sort((a, b) => b.score - a.score);
  }

  static getUrgentPages(pages: PageMastery[], today: Date): PageMastery[] {
    return UrgencyScoring.rankPages(pages, today)
      .filter((sp) => sp.score >= UrgencyScoring.URGENT_THRESHOLD)
      .map((sp) => sp.page);
  }

  static getSabaqPauseRatio(pages: PageMastery[], today: Date): number {
    if (pages.length === 0) return 0;
    const highRiskCount = UrgencyScoring.rankPages(pages, today)
      .filter((sp) => sp.score >= UrgencyScoring.SABAQ_PAUSE_THRESHOLD).length;
    return highRiskCount / pages.length;
  }
}
