import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './infra/configs/database';
import { HealthModule } from './infra/health/health.module';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  BankAccountModel,
  CustomerModel,
  TransactionModel,
} from './infra/persistence/sequelize/models/customer.model';
import { AppController } from './app.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './application/commands';
import { UnitOfWork } from './infra/persistence/sequelize/unit-of-work';
import { CustomerRepository } from './infra/persistence/sequelize/repositories/customer.repository';
import { BankAccountRepository } from './infra/persistence/sequelize/repositories/bank-account-repository';
import { QueriesHandlers } from './application/queries';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'root',
      password: 'root',
      database: 'mock_bank',
      models: [CustomerModel, BankAccountModel, TransactionModel],
    }),
    CqrsModule,
    HealthModule,
  ],
  providers: [
    ...CommandHandlers,
    ...QueriesHandlers,
    {
      provide: 'UnitOfWork',
      useClass: UnitOfWork,
    },
    {
      provide: 'CustomerRepository',
      useClass: CustomerRepository,
    },
    {
      provide: 'BankAccountRepository',
      useClass: BankAccountRepository,
    },
  ],
  // exports: [],
  controllers: [AppController],
})
export class AppModule {}
