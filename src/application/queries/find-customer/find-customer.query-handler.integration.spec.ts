import { fakerPT_BR } from '@faker-js/faker/.';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { BankAccountStatus } from 'src/domain/entities/bank-account/bank-account';
import { CustomerTestFixture } from 'src/domain/entities/bank-account/bank-account.unit.spec';
import { CustomerRepository } from 'src/infra/persistence/sequelize/repositories/customer.repository';
import { BankAccountRepository } from 'src/infra/persistence/sequelize/repositories/bank-account-repository';
import { UnitOfWork } from 'src/infra/persistence/sequelize/unit-of-work';
import { IntegrationTestHelpers } from 'src/infra/test-helpers/integration/setup-test-container';
import { FindCustomerQueryHandler } from './find-customer.query-handler';
import { FindCustomerQuery } from './find-customer-query';
import { uuidv7 } from 'uuidv7';
import { OpenAccountCommandHandler } from 'src/application/commands/open-account/open-account.command-handler';
import { OpenAccountCommandHandlerFixture } from 'src/application/commands/open-account/open-account.command-handler.integration.spec';

describe('FindCustomerQueryHandler', () => {
  const containers = IntegrationTestHelpers.setupTestContainer();
  let sut: FindCustomerQueryHandler;
  let openAccountCommandHandler: OpenAccountCommandHandler;
  let testingModule: TestingModule;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [...IntegrationTestHelpers.registerDefaultModules()],
      providers: [
        FindCustomerQueryHandler,
        OpenAccountCommandHandler,
        {
          provide: 'CustomerRepository',
          useClass: CustomerRepository,
        },
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
    }).compile();
    sut = await mod.get(FindCustomerQueryHandler);
    openAccountCommandHandler = await mod.get(OpenAccountCommandHandler);
    testingModule = mod;
  });

  afterEach(async () => {
    await containers.postgreSqlContainer.stop();
    await testingModule.close();
  });

  test('Ao testar buscar os dados de um cliente que não existe, deve ser lançado um erro', async () => {
    await expect(sut.execute(new FindCustomerQuery(uuidv7()))).rejects.toThrow(
      'Cliente não encontrado',
    );
  });

  test('Ao buscar os dados de um cliente com um id que existe, os seus dados devem ser retornados junto com as suas contas bancarias', async () => {
    const input = OpenAccountCommandHandlerFixture.openAccountCommand();
    const { id } = await openAccountCommandHandler.execute(input);

    const result = await sut.execute(new FindCustomerQuery(id));

    expect(result.id).toBe(id);
    expect(result.fullName).toBe(input.fullName);
    expect(result.document).toBe(input.document);
    expect(result.birthDate).toEqual(input.birthDate);
    expect(result.bankAccounts).toHaveLength(1);
    expect(result.bankAccounts[0].number).toBeDefined();
    expect(result.bankAccounts[0].status).toBe(BankAccountStatus.Active);
  });
});
