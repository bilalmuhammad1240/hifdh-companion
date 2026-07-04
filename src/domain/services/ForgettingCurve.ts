import { PageMastery } from '../entities/PageMastery';

/**
 * ForgettingCurve — Modelo de risco de esquecimento baseado na curva de
 * Ebbinghaus, adaptado ao contexto de Hifdh.
 *
 * R(t) = e^(-t/S)
 *
 * onde:
 *   t = dias desde a última revisão
 *   S = "estabilidade" da memória, derivada do masteryLevel e do
 *       intervalo de revisão já alcançado pela página.
 *
 * Retorna um valor entre 0 (sem risco) e 1 (esquecimento quase certo).
 */
export class ForgettingCurve {
  static daysSince(date: Date | null, today: Date): number {
    if (!date) return 9999; // nunca revisada → risco máximo
    const ms = today.getTime() - date.getTime();
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  }

  static calculateStability(page: PageMastery): number {
    // Quanto maior o masteryLevel e o intervalo já alcançado, mais
    // estável (resistente ao esquecimento) a memória se torna.
    const baseStability = page.masteryLevel * page.intervalDays * 0.3;
    return Math.max(1, baseStability);
  }

  static calculateRisk(page: PageMastery, today: Date): number {
    const daysSinceReview = ForgettingCurve.daysSince(page.lastReviewedAt, today);
    const stability = ForgettingCurve.calculateStability(page);
    const risk = 1 - Math.exp(-daysSinceReview / stability);
    return Math.max(0, Math.min(1, risk));
  }

  /** Estimativa de retenção atual (inverso do risco). */
  static calculateRetention(page: PageMastery, today: Date): number {
    return 1 - ForgettingCurve.calculateRisk(page, today);
  }
}
