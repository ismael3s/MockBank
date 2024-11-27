import { BankAccount } from '../entities/bank-account/bank-account';
import { Transaction } from '../entities/bank-account/transaction';

export class TransactionDomainService {
  public static deposit(bankAccount: BankAccount, amount: number): void {
    if (!bankAccount.isActive())
      throw new Error(
        'Não é possível realizar transações em uma conta inativa',
      );
    if (amount <= 0)
      throw new Error('O valor do depósito deve ser maior que zero');
    const transaction = Transaction.deposit(bankAccount.id, amount);
    bankAccount.addTransaction(transaction);
  }

  public static withdraw(bankAccount: BankAccount, amount: number): void {
    if (!bankAccount.isActive())
      throw new Error(
        'Não é possível realizar transações em uma conta inativa',
      );
    if (amount <= 0)
      throw new Error('O valor do saque deve ser maior que zero');
    if (bankAccount.getBalance() < amount)
      throw new Error('Saldo insuficiente');
    const transaction = Transaction.withdraw(bankAccount.id, amount);
    bankAccount.addTransaction(transaction);
  }

  public static transfer(
    from: BankAccount,
    to: BankAccount,
    amount: number,
  ): void {
    if (!from.isActive() || !to.isActive())
      throw new Error(
        'Não é possível realizar transações em uma conta inativa',
      );
    if (amount <= 0)
      throw new Error('O valor da transferência deve ser maior que zero');
    if (from.getBalance() < amount) throw new Error('Saldo insuficiente');
    const transaction = Transaction.transfer(from.id, to.id, amount);
    from.addTransaction(transaction);
    to.addTransaction(transaction);
  }
}
