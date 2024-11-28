import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { Logger, LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({}),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        models: [CustomerModel, BankAccountModel, TransactionModel],
        logging: false,
      }),
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
    {
      provide: 'Logger',
      useValue: Logger,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
