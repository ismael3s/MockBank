import { uuidv7 } from 'uuidv7';
import { Entity } from '../../abstractions/entity';
import { BankAccount, BankAccountStatus } from './bank-account';

export enum TransactionType {
  Deposit = 'deposit',
  Withdraw = 'withdraw',
  Transfer = 'transfer',
}

export class Transaction extends Entity {
  private type: TransactionType;

  private amount: number;

  private createdAt: Date;

  private from?: string;

  private to?: string;

  private constructor(
    type: TransactionType,
    amount: number,
    from: string,
    to?: string,
    id: string = uuidv7(),
    createdAt: Date = new Date(),
  ) {
    super(id);
    this.type = type;
    this.amount = amount;
    this.createdAt = createdAt;
    this.from = from;
    this.to = to;
  }

  public static deposit(from: string, amount: number): Transaction {
    return new Transaction(TransactionType.Deposit, amount, from);
  }

  public static withdraw(from: string, amount: number): Transaction {
    return new Transaction(TransactionType.Withdraw, amount, from);
  }

  static transfer(from: string, to: string, amount: number) {
    return new Transaction(TransactionType.Transfer, amount, from, to);
  }

  public static restore(input: {
    id: string;
    type: TransactionType;
    amount: number;
    createdAt: Date;
    from: string;
    to?: string;
  }): Transaction {
    const transaction = new Transaction(
      input.type,
      input.amount,
      input.from,
      input.to,
      input.id,
      input.createdAt,
    );
    return transaction;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getAmount() {
    return this.amount;
  }

  getType() {
    return this.type;
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
