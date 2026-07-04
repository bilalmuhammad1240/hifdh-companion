/**
 * PageNumber — Value Object
 * Representa um número de página válido do Mushaf Al-Madinah (1–604).
 */
export class PageNumber {
  private constructor(private readonly value: number) {}

  static readonly MIN = 1;
  static readonly MAX = 604;

  static create(value: number): PageNumber {
    if (!Number.isInteger(value)) {
      throw new Error(`Número de página inválido: ${value} não é um inteiro.`);
    }
    if (value < PageNumber.MIN || value > PageNumber.MAX) {
      throw new Error(
        `Número de página fora do intervalo válido (${PageNumber.MIN}-${PageNumber.MAX}): ${value}`
      );
    }
    return new PageNumber(value);
  }

  toNumber(): number {
    return this.value;
  }

  equals(other: PageNumber): boolean {
    return this.value === other.value;
  }

  next(): PageNumber | null {
    if (this.value >= PageNumber.MAX) return null;
    return PageNumber.create(this.value + 1);
  }

  isLastPage(): boolean {
    return this.value === PageNumber.MAX;
  }
}
