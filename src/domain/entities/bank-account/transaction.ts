import { Entity } from '../../abstractions/entity';
import { BankAccount } from './bank-account';

export enum TransactionType {
  Deposit = 'deposit',
  Withdraw = 'withdraw',
  Transfer = 'transfer',
}

export class Transaction extends Entity {
  private type: TransactionType;

  private amount: number;

  private createdAt: Date;

  private from?: BankAccount;

  private to?: BankAccount;

  private constructor(
    type: TransactionType,
    amount: number,
    from?: BankAccount,
    to?: BankAccount,
  ) {
    super();
    this.type = type;
    this.amount = amount;
    this.createdAt = new Date();
    this.from = from;
    this.to = to;
  }

  public static deposit(from: BankAccount, amount: number): Transaction {
    return new Transaction(TransactionType.Deposit, amount, from);
  }

  public static withdraw(from: BankAccount, amount: number): Transaction {
    return new Transaction(TransactionType.Withdraw, amount, from);
  }

  static transfer(from: BankAccount, to: BankAccount, amount: number) {
    return new Transaction(TransactionType.Transfer, amount, from, to);
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getAmount() {
    return this.amount;
  }

  isDeposit() {
    return this.type === TransactionType.Deposit;
  }

  getTo() {
    return this.to;
  }

  getFrom() {
    return this.from;
  }

  isTransfer() {
    return this.type === TransactionType.Transfer;
  }
}
