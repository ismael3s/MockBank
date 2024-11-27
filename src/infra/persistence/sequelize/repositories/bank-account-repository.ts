import { Injectable } from '@nestjs/common';
import { Transaction, Model } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { BankAccount } from 'src/domain/entities/bank-account/bank-account';
import { IBankAccountRepository } from 'src/domain/entities/bank-account/ibank-account.repository.interface';
import { Customer } from 'src/domain/entities/customer/customer';
import {
  CustomerModel,
  TransactionModel,
  BankAccountModel,
} from '../models/customer.model';

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

  async update(bankAccount: BankAccount): Promise<void> {
    await this.repository.update(
      {
        status: bankAccount.getStatus(),
        balance: bankAccount.getBalance(),
        updatedAt: new Date(),
      },
      {
        where: {
          id: bankAccount.id,
        },
      },
    );

    for (const transaction of bankAccount.getTransactions()) {
      await this.sequelize.models.TransactionModel.findOrCreate({
        where: {
          id: transaction.id,
        },
        defaults: {
          id: transaction.id,
          amount: transaction.getAmount(),
          type: transaction.getType(),
          fromBankAccountId: transaction.getFrom(),
          toBankAccountId: transaction.getTo(),
          createdAt: transaction.getCreatedAt(),
        },
      });
    }
  }

  async findById(id: string): Promise<BankAccount | null> {
    const bankAccount = await this.repository.findByPk(id, {
      lock: Transaction.LOCK.UPDATE,
      include: [
        {
          model: CustomerModel,
          required: true,
        },
      ],
    });
    if (!bankAccount) return null;
    const transactionsSent =
      await this.sequelize.models.TransactionModel.findAll<
        Model<TransactionModel, TransactionModel>
      >({
        where: {
          fromBankAccountId: id,
        },
        include: [
          {
            model: BankAccountModel,
            as: 'fromBankAccount',
            required: true,
          },
          {
            model: BankAccountModel,
            as: 'toBankAccount',
            required: false,
          },
        ],
      });
    const transactionsReceived =
      await this.sequelize.models.TransactionModel.findAll<
        Model<TransactionModel, TransactionModel>
      >({
        where: {
          toBankAccountId: id,
        },
        include: [
          {
            model: BankAccountModel,
            as: 'fromBankAccount',
            required: true,
          },
          {
            model: BankAccountModel,
            as: 'toBankAccount',
            required: false,
          },
        ],
      });
    const customerModel = bankAccount.dataValues.customer;
    const customer = Customer.restore({
      bankAccounts: [],
      birthDate: customerModel.dataValues.birthDate,
      createdAt: customerModel.dataValues.createdAt,
      document: customerModel.dataValues.document,
      fullName: customerModel.dataValues.fullName,
      id: customerModel.dataValues.id,
    });
    return BankAccount.restore({
      id: bankAccount.dataValues.id,
      status: bankAccount.dataValues.status,
      number: bankAccount.dataValues.number,
      customer: customer,
      transactions: [...transactionsReceived, ...transactionsSent].map(
        (transaction) => ({
          id: transaction.dataValues.id,
          amount: Number(transaction.dataValues.amount),
          type: transaction.dataValues.type,
          createdAt: transaction.dataValues.createdAt,
          to: {
            id: transaction.dataValues.toBankAccountId,
          },
        }),
      ),
      createdAt: bankAccount.dataValues.createdAt,
      updatedAt: bankAccount.dataValues.updatedAt,
      balance: bankAccount.dataValues.balance || 0,
    });
  }
}
