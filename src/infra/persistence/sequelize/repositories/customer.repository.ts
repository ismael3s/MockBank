import { ICustomerRepository } from 'src/domain/entities/customer/icustomer.repository.interface';
import { BankAccountModel, CustomerModel } from '../models/customer.model';
import { Customer } from 'src/domain/entities/customer/customer';
import { Model, Transaction } from 'sequelize';
import { Injectable } from '@nestjs/common';
import { BankAccount } from 'src/domain/entities/bank-account/bank-account';
import { IBankAccountRepository } from 'src/domain/entities/bank-account/ibank-account.repository.interface';
import { Sequelize } from 'sequelize-typescript';
import { Document } from 'src/domain/vo/document';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(private readonly sequelize: Sequelize) {}

  async existsByDocument(document: Document, transaction): Promise<boolean> {
    const customer = await this.repository.findOne({
      where: {
        document: document.value,
      },
      lock: Transaction.LOCK.UPDATE,
      transaction,
    });
    return !!customer;
  }

  private get repository() {
    return this.sequelize.models.CustomerModel;
  }

  async create(
    customer: Customer,
    transaction: Transaction = null,
  ): Promise<void> {
    await this.repository.create(
      {
        id: customer.id,
        fullName: customer.getFullName().value,
        document: customer.getDocument().value,
        birthDate: customer.getBirthDate(),
      },
      {
        transaction,
      },
    );
  }

  async findById(id: string): Promise<Customer | null> {
    const customerModel = await this.repository.findByPk<Model<any>>(id, {
      include: [BankAccountModel],
    });
    if (!customerModel) return null;
    return Customer.restore({
      id: customerModel.dataValues.id,
      fullName: customerModel.dataValues.fullName,
      document: customerModel.dataValues.document,
      birthDate: customerModel.dataValues.birthDate,
      createdAt: customerModel.dataValues.createdAt,
      bankAccounts: customerModel.dataValues.bankAccounts.map((account) => ({
        status: account.status,
        id: account.id,
        createdAt: account.createdAt,
        balance: account.balance,
      })),
    });
  }
}

@Injectable()
export class BankAccountRepository implements IBankAccountRepository {
  constructor(private readonly sequelize: Sequelize) {}

  private get repository() {
    return this.sequelize.models.BankAccountModel;
  }

  async create(
    bankAccount: BankAccount,
    transaction: Transaction = null,
  ): Promise<void> {
    await this.repository.create(
      {
        id: bankAccount.id,
        status: bankAccount.getStatus(),
        number: bankAccount.getNumber().value,
        customerId: bankAccount.getCustomer().id,
      },
      {
        transaction,
      },
    );
  }
}
