import { ApplicationError } from '../exceptions/application-exception';

export class FullName {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value.trim();
  }

  public static from(value: string): FullName {
    if (!value || value.trim().length === 0) {
      throw new ApplicationError('O nome completo é obrigatório');
    }
    return new FullName(value);
  }
}
