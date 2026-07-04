/**
 * ReviewGrade — Value Object
 * Nota de uma revisão, na escala SM-2 (0–5), adaptada ao contexto de Hifdh.
 *
 * 0 — Blackout total (esqueceu completamente)
 * 1 — Errou bastante
 * 2 — Errou mas reconheceu ao ouvir
 * 3 — Difícil mas recitou corretamente
 * 4 — Bom, fluência razoável
 * 5 — Excelente, fluência perfeita
 */
export class ReviewGrade {
  private constructor(private readonly value: number) {}

  static readonly MIN = 0;
  static readonly MAX = 5;
  static readonly PASSING_THRESHOLD = 3;

  static create(value: number): ReviewGrade {
    const clamped = Math.max(ReviewGrade.MIN, Math.min(ReviewGrade.MAX, Math.round(value)));
    return new ReviewGrade(clamped);
  }

  /** Converte contagem de erros em uma nota aproximada (heurística simples). */
  static fromErrorCount(errorCount: number): ReviewGrade {
    if (errorCount === 0) return ReviewGrade.create(5);
    if (errorCount === 1) return ReviewGrade.create(4);
    if (errorCount === 2) return ReviewGrade.create(3);
    if (errorCount <= 4) return ReviewGrade.create(2);
    if (errorCount <= 6) return ReviewGrade.create(1);
    return ReviewGrade.create(0);
  }

  toNumber(): number {
    return this.value;
  }

  isPassing(): boolean {
    return this.value >= ReviewGrade.PASSING_THRESHOLD;
  }

  isBlackout(): boolean {
    return this.value === 0;
  }
}
