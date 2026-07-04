/**
 * JuzNumber — Value Object
 * Representa um Juz' válido (1–30).
 */
export class JuzNumber {
  private constructor(private readonly value: number) {}

  static readonly MIN = 1;
  static readonly MAX = 30;

  static create(value: number): JuzNumber {
    if (!Number.isInteger(value)) {
      throw new Error(`Número de Juz' inválido: ${value} não é um inteiro.`);
    }
    if (value < JuzNumber.MIN || value > JuzNumber.MAX) {
      throw new Error(
        `Juz' fora do intervalo válido (${JuzNumber.MIN}-${JuzNumber.MAX}): ${value}`
      );
    }
    return new JuzNumber(value);
  }

  toNumber(): number {
    return this.value;
  }

  equals(other: JuzNumber): boolean {
    return this.value === other.value;
  }
}
