import { Entity } from '../../abstractions/entity';
import { BankAccountNumber } from '../../vo/bank-account-number';
import { Customer } from '../customer/customer';
import { Transaction } from './transaction';

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
    transactions: Transaction[];
  }): BankAccount {
    const bankAccount = new BankAccount(input.id);
    bankAccount.status = input.status;
    bankAccount.number = BankAccountNumber.from(input.number);
    bankAccount.createdAt = input.createdAt;
    bankAccount.updatedAt = input.updatedAt;
    bankAccount.balance = input.balance;
    bankAccount.transactions = input.transactions;
    return bankAccount;
  }

  public getStatus(): BankAccountStatus {
    return this.status;
  }

  public getBalance(): number {
    return this.transactions.reduce((acc, transaction) => {
      if (transaction.isDeposit()) return acc + transaction.getAmount();
      if (transaction.isTransfer() && transaction.getTo().id === this.id) {
        return acc + transaction.getAmount();
      }
      if (transaction.isTransfer() && transaction.getFrom().id === this.id) {
        return acc - transaction.getAmount();
      }
      return acc - transaction.getAmount();
    }, this.balance);
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
    this.status = BankAccountStatus.Inactive;
  }

  public getNumber(): BankAccountNumber {
    return this.number;
  }

  public getCustomer(): Customer {
    return this.customer;
  }
}
