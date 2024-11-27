import {
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Model,
  NotNull,
  Table,
} from 'sequelize-typescript';
import { BankAccountStatus } from 'src/domain/entities/bank-account/bank-account';
import { TransactionType } from 'src/domain/entities/bank-account/transaction';

@Table({
  timestamps: true,
  underscored: true,
  tableName: 'customers',
})
export class CustomerModel extends Model {
  @Column({
    primaryKey: true,
    type: 'uuid',
    allowNull: false,
  })
  declare id: string;

  @Column({
    allowNull: false,
  })
  declare fullName: string;

  @Column({
    unique: true,
    allowNull: false,
  })
  declare document: string;

  @Column({
    allowNull: false,
  })
  declare birthDate: Date;

  @HasMany(() => BankAccountModel)
  declare bankAccounts: BankAccountModel[];
}

@Table({
  timestamps: true,
  underscored: true,
  tableName: 'bank_accounts',
})
export class BankAccountModel extends Model {
  @Column({
    primaryKey: true,
    type: 'uuid',
    allowNull: false,
  })
  declare id: string;

  @Column({
    unique: true,
    allowNull: false,
  })
  declare number: string;

  @Column({
    type: 'enum',
    values: [BankAccountStatus.Active, BankAccountStatus.Inactive],
  })
  declare status: BankAccountStatus;

  @Column
  @ForeignKey(() => CustomerModel)
  declare customerId: string;

  @BelongsTo(() => CustomerModel)
  declare customer: CustomerModel;

  @HasMany(() => TransactionModel, 'fromBankAccountId')
  declare transactions: TransactionModel[];

  @HasMany(() => TransactionModel, 'toBankAccountId')
  declare transactionsTo: TransactionModel[];
}

@Table({
  timestamps: true,
  underscored: true,
  tableName: 'transactions',
  updatedAt: false,
})
export class TransactionModel extends Model {
  @Column({
    primaryKey: true,
    type: 'uuid',
    allowNull: false,
  })
  declare id: string;

  @Column({
    allowNull: false,
  })
  declare amount: number;

  @Column({
    type: 'enum',
    values: [
      TransactionType.Deposit,
      TransactionType.Withdraw,
      TransactionType.Transfer,
    ],
    allowNull: false,
  })
  declare type: string;

  @Column({
    allowNull: false,
  })
  declare fromBankAccountId: string;

  @BelongsTo(() => BankAccountModel, 'fromBankAccountId')
  fromBankAccount: BankAccountModel;

  @Column({
    allowNull: true,
  })
  declare toBankAccountId?: string;

  @BelongsTo(() => BankAccountModel, 'toBankAccountId')
  declare toBankAccount?: BankAccountModel;
}
