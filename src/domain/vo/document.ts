export class Document {
  public readonly value: string;

  private constructor(value: string) {
    this.value = Document.sanitizeValue(value);
    this.validate();
  }

  private static sanitizeValue(value: string): string {
    return (value || '').replace(/\D/g, '').trim();
  }

  private validate(): void {
    if (!this.value || this.value.trim() === '') {
      throw new Error('O CPF deve ser válido');
    }

    if (this.value.length < 11 || this.value.length > 14) {
      throw new Error('O CPF deve ser válido');
    }

    if (!this.isValid(this.value)) {
      throw new Error('O CPF deve ser válido');
    }
  }

  private isAllSameDigit(): boolean {
    return new Set(this.value).size === 1;
  }

  private static calculateDigits(
    value: string,
    multipliers: number[],
    loopCount = 9,
  ): string {
    let sum = 0;

    for (let i = 0; i < loopCount; i++) {
      sum += parseInt(value[i]) * multipliers[i];
    }

    const rest = sum % 11;
    const digit = rest < 2 ? 0 : 11 - rest;
    return digit.toString();
  }

  private isValid(cpf: string): boolean {
    if (this.isAllSameDigit()) return false;
    const multiplierForFirstDigit = [10, 9, 8, 7, 6, 5, 4, 3, 2];
    const multiplierForSecondDigit = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    const firstNineNumbers = cpf.slice(0, 9);
    let digit = Document.calculateDigits(
      firstNineNumbers,
      multiplierForFirstDigit,
      9,
    );
    digit += Document.calculateDigits(
      firstNineNumbers + digit,
      multiplierForSecondDigit,
      10,
    );
    return cpf.endsWith(digit);
  }

  public static from(value: string): Document {
    return new Document(value);
  }

  public getValue(): string {
    return this.value;
  }
}
