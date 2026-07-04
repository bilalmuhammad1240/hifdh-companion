/**
 * MasteryLevel — Value Object
 * Representa o nível de domínio de uma página (0–5), conforme
 * a escala definida no documento de arquitetura:
 *
 * 0 — Nunca estudada
 * 1 — Nova
 * 2 — Fraca
 * 3 — Regular
 * 4 — Boa
 * 5 — Excelente
 */
export class MasteryLevel {
  private constructor(private readonly value: number) {}

  static readonly MIN = 0;
  static readonly MAX = 5;

  private static readonly LABELS: Record<number, string> = {
    0: 'Nunca estudada',
    1: 'Nova',
    2: 'Fraca',
    3: 'Regular',
    4: 'Boa',
    5: 'Excelente',
  };

  static create(value: number): MasteryLevel {
    const clamped = Math.max(MasteryLevel.MIN, Math.min(MasteryLevel.MAX, Math.round(value)));
    return new MasteryLevel(clamped);
  }

  toNumber(): number {
    return this.value;
  }

  label(): string {
    return MasteryLevel.LABELS[this.value] ?? 'Desconhecido';
  }

  increase(amount = 1): MasteryLevel {
    return MasteryLevel.create(this.value + amount);
  }

  decrease(amount = 1): MasteryLevel {
    return MasteryLevel.create(this.value - amount);
  }

  isAtLeast(threshold: number): boolean {
    return this.value >= threshold;
  }

  equals(other: MasteryLevel): boolean {
    return this.value === other.value;
  }
}
