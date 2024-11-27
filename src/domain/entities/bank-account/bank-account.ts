import { Entity } from '../../abstractions/entity';
import { BankAccountNumber } from '../../vo/bank-account-number';
import { Customer } from '../customer/customer';
import { Transaction, TransactionType } from './transaction';

export enum BankAccountStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export class BankAccount extends Entity {
  private status: BankAccountStatus;

  private number: BankAccountNumber;

  private createdAt: Date;

  private balance: number = 0;

  private updatedAt: Date;

  private customer: Customer;

  private transactions: Transaction[] = [];

  private constructor(id?: string) {
    super(id);
  }

  public static create(customer: Customer): BankAccount {
    const bankAccount = new BankAccount();
    bankAccount.status = BankAccountStatus.Active;
    bankAccount.number = BankAccountNumber.create();
    bankAccount.customer = customer;
    bankAccount.number;
    bankAccount.createdAt = new Date();
    bankAccount.updatedAt = new Date();
    return bankAccount;
  }

  public static restore(input: {
    id: string;
    status: BankAccountStatus;
    number: string;
    createdAt: Date;
    updatedAt: Date;
    balance: number;
    customer: Customer;
    transactions: {
      id: string;
      amount: number;
      type: string;
      to: { id: string };
      createdAt: Date;
    }[];
  }): BankAccount {
    const bankAccount = new BankAccount(input.id);
    bankAccount.status = input.status;
    bankAccount.number = BankAccountNumber.from(input.number);
    bankAccount.createdAt = input.createdAt;
    bankAccount.updatedAt = input.updatedAt;
    bankAccount.balance = input.balance;
    bankAccount.transactions = input.transactions.map((transaction) =>
      Transaction.restore({
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.type as TransactionType,
        to: transaction.to.id,
        from: bankAccount.id,
        createdAt: transaction.createdAt,
      }),
    );
    bankAccount.customer = input.customer;
    return bankAccount;
  }

  public getStatus(): BankAccountStatus {
    return this.status;
  }

  public getBalance(): number {
    // TODO: Ensure thaat isn't possible to transfer to the same account
    return this.transactions.reduce((acc, transaction) => {
      if (transaction.isDeposit()) return acc + transaction.getAmount();
      if (transaction.isTransfer() && transaction.getTo() === this.id) {
        return acc + transaction.getAmount();
      }
      if (transaction.isTransfer() && transaction.getFrom() === this.id) {
        return acc - transaction.getAmount();
      }
      return acc - transaction.getAmount();
    }, 0);
  }

  public getLastTransaction(): Transaction {
    return this.transactions[this.transactions.length - 1];
  }

  public getTransactions(): ReadonlyArray<Transaction> {
    return this.transactions;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public isActive(): boolean {
    return this.status === BankAccountStatus.Active;
  }

  public addTransaction(transaction: Transaction) {
    this.transactions.push(transaction);
  }

  public inactivate() {
    if (this.status === BankAccountStatus.Inactive)
      throw new Error('Conta já está inativa');
    this.status = BankAccountStatus.Inactive;
  }

  public active() {
    if (this.status === BankAccountStatus.Active)
      throw new Error('Conta já está ativa');
    this.status = BankAccountStatus.Active;
  }

  public getNumber(): BankAccountNumber {
    return this.number;
  }

  public getCustomer(): Customer {
    return this.customer;
  }
}
