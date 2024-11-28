import { uuidv7 } from 'uuidv7';
import { ApplicationError } from '../exceptions/application-exception';

export class BankAccountNumber {
  public readonly value: string;

  constructor(value: string = uuidv7()) {
    this.value = value;
    if (!BankAccountNumber.isValid(value)) {
      throw new ApplicationError('Número de conta bancária inválido');
    }
  }

  private static isValid(value: string): boolean {
    const uuidV7Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV7Regex.test(value);
  }

  public static create(): BankAccountNumber {
    return new BankAccountNumber();
  }

  public static from(value: string): BankAccountNumber {
    return new BankAccountNumber(value);
  }
}
