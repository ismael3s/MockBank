import { ConfigModule, registerAs } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Client } from 'pg';
import { Sequelize } from 'sequelize-typescript';
import {
  BankAccountModel,
  CustomerModel,
  TransactionModel,
} from 'src/infra/persistence/sequelize/models/customer.model';
import { SequelizeStorage, Umzug } from 'umzug';

let container: StartedPostgreSqlContainer;
const cls = require('cls-hooked');
const namespace = cls.createNamespace('my-very-own-namespace');
Sequelize.useCLS(namespace);

const databaseName = 'mock_bank_test';

export class IntegrationTestHelpers {
  static setupTestContainer() {
    beforeEach(async () => {
      container = await new PostgreSqlContainer('postgres:17-alpine')
        .withTmpFs({ '/var/lib/postgresql/data': 'rw' })
        .start();
      process.env.DATABASE_HOST = container.getHost();
      process.env.DATABASE_PORT = container.getPort().toString();
      process.env.DATABASE_USER = container.getUsername();
      process.env.DATABASE_PASSWORD = container.getPassword();
      const client = new Client({
        host: container.getHost(),
        port: container.getPort(),
        database: container.getDatabase(),
        user: container.getUsername(),
        password: container.getPassword(),
      });
      await client.connect();
      await client.query(`CREATE DATABASE "${databaseName}"`);
      await client.end();

      const app = await Test.createTestingModule({
        imports: [
          SequelizeModule.forRoot({
            dialect: 'postgres',
            host: container.getHost(),
            port: container.getPort(),
            username: container.getUsername(),
            password: container.getPassword(),
            database: container.getDatabase(),
            models: [CustomerModel, BankAccountModel, TransactionModel],
            logging: false,
          }),
        ],
      }).compile();

      const sequelize = app.get(Sequelize);

      const umzug = new Umzug({
        migrations: {
          glob: __dirname + '/../../../**/migrations/*.js',
        },
        context: sequelize.getQueryInterface(),
        storage: new SequelizeStorage({ sequelize }),
        logger: {
          info: () => {},
          warn: console.warn,
          error: console.error,
          debug: () => {},
        },
      });
      await umzug.up();
      await sequelize.close();
      await app.close();
    }, 80_000);

    afterEach(async () => {
      await container.stop();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    return {
      get postgreSqlContainer() {
        return container;
      },
    };
  }

  static registerDefaultModules(
    { configs } = {
      configs: {
        database: {
          type: 'postgres',
          host: container.getHost(),
          port: container.getPort(),
          username: container.getUsername(),
          password: container.getPassword(),
          database: databaseName,
        },
      },
    },
  ) {
    return [
      CqrsModule,
      ConfigModule.forRoot({
        isGlobal: true,
        load: [registerAs('database', () => configs.database)],
      }),
      SequelizeModule.forRoot({
        dialect: 'postgres',
        host: container.getHost(),
        port: container.getPort(),
        username: container.getUsername(),
        password: container.getPassword(),
        database: container.getDatabase(),
        models: [CustomerModel, BankAccountModel, TransactionModel],
        logging: false,
      }),
    ];
  }
}
