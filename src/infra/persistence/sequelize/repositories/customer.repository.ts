import { Injectable } from '@nestjs/common';
import { Model, Op, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Customer } from 'src/domain/entities/customer/customer';
import { ICustomerRepository } from 'src/domain/entities/customer/icustomer.repository.interface';
import { Document } from 'src/domain/vo/document';
import { BankAccountModel } from '../models/customer.model';

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
