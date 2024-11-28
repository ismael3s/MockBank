import { BankAccount } from '../entities/bank-account/bank-account';
import { Transaction } from '../entities/bank-account/transaction';
import { ApplicationError } from '../exceptions/application-exception';

export class TransactionDomainService {
  public static deposit(bankAccount: BankAccount, amount: number): void {
    if (!bankAccount.isActive())
      throw new ApplicationError(
        'Não é possível realizar transações em uma conta inativa',
      );
    if (amount <= 0)
      throw new ApplicationError('O valor do depósito deve ser maior que zero');
    const transaction = Transaction.deposit(bankAccount.id, amount);
    bankAccount.addTransaction(transaction);
  }

  public static withdraw(bankAccount: BankAccount, amount: number): void {
    if (!bankAccount.isActive())
      throw new ApplicationError(
        'Não é possível realizar transações em uma conta inativa',
      );
    if (amount <= 0)
      throw new ApplicationError('O valor do saque deve ser maior que zero');
    if (bankAccount.getBalance() < amount)
      throw new ApplicationError('Saldo insuficiente');
    const transaction = Transaction.withdraw(bankAccount.id, amount);
    bankAccount.addTransaction(transaction);
  }

  public static transfer(
    from: BankAccount,
    to: BankAccount,
    amount: number,
  ): void {
    if (from.id === to.id)
      throw new ApplicationError(
        'Não é possível realizar transferências para a mesma conta',
      );
    if (!from.isActive() || !to.isActive())
      throw new ApplicationError(
        'Não é possível realizar transações em uma conta inativa',
      );
    if (amount <= 0)
      throw new ApplicationError(
        'O valor da transferência deve ser maior que zero',
      );
    if (from.getBalance() < amount)
      throw new ApplicationError('Saldo insuficiente');
    const transaction = Transaction.transfer(from.id, to.id, amount);
    from.addTransaction(transaction);
    to.addTransaction(transaction);
  }
}
