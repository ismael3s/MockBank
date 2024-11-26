import { BankAccount } from './bank-account';

export interface IBankAccountRepository {
  create(bankAccount: BankAccount, transaction?: any): Promise<void>;
}
