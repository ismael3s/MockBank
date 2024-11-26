import { Entity } from '../../abstractions/entity';
import { Document } from '../../vo/document';
import { FullName } from '../../vo/full-name';
import { BankAccount, BankAccountStatus } from '../bank-account/bank-account';

export class Customer extends Entity {
  private fullName: FullName;

  private document: Document;

  private birthDate: Date;

  private createdAt: Date;

  private updatedAt: Date;

  private bankAccounts: Array<BankAccount> = [];

  private constructor(id?: string) {
    super(id);
  }

  public static create(
    fullName: string,
    document: string,
    birthDate: Date,
  ): Customer {
    const customer = new Customer();
    customer.fullName = FullName.from(fullName);
    customer.document = Document.from(document);
    customer.birthDate = birthDate;
    customer.createdAt = new Date();
    customer.updatedAt = new Date();
    customer.addBankAccount();
    return customer;
  }

  public static restore(input: {
    id: string;
    fullName: string;
    document: string;
    birthDate: Date;
    createdAt: Date;
    bankAccounts: Array<{
      status: BankAccountStatus;
      id: string;
      number: string;
      balance: number;
    }>;
  }) {
    const customer = new Customer(input.id);
    customer.fullName = FullName.from(input.fullName);
    customer.document = Document.from(input.document);
    customer.birthDate = input.birthDate;
    customer.createdAt = input.createdAt;
    customer.updatedAt = new Date();
    customer.bankAccounts = input.bankAccounts.map((account) =>
      BankAccount.restore({
        id: account.id,
        status: account.status,
        number: account.number,
        createdAt: new Date(),
        updatedAt: new Date(),
        balance: account.balance || 0,
        customer: customer,
        transactions: [],
      }),
    );
    return customer;
  }

  public addBankAccount(): BankAccount {
    const bankAccount = BankAccount.create(this);
    this.bankAccounts.push(bankAccount);
    return bankAccount;
  }

  public getFullName(): FullName {
    return this.fullName;
  }

  public getBankAccounts() {
    return this.bankAccounts;
  }

  public getUpdatedAt(): any {
    return this.updatedAt;
  }

  public getCreatedAt(): any {
    return this.createdAt;
  }
  public getBirthDate() {
    return this.birthDate;
  }
  public getDocument() {
    return this.document;
  }
}
