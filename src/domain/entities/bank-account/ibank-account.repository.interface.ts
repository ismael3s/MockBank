import { BankAccount } from './bank-account';

export interface IBankAccountRepository {
  update(bankAccount: BankAccount): unknown;
  create(bankAccount: BankAccount, transaction?: any): Promise<void>;
  findById(id: string): Promise<BankAccount | null>;
}
