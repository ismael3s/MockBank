import { IntegrationTestHelpers } from 'src/modules/shared/test-helpers/integration/setup-test-container';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { UnitOfWork } from 'src/infra/persistence/sequelize/unit-of-work';
import {
  BankAccountRepository,
  CustomerRepository,
} from 'src/infra/persistence/sequelize/repositories/customer.repository';
import { uuidv7 } from 'uuidv7';
import { ChangeBankAccountStatusCommandHandler } from 'src/application/commands/change-bank-account-status/change-bank-account-status.command-handler';
import { OpenAccountCommandHandler } from 'src/application/commands/open-account/open-account.command-handler';
import { AddAccountCommandHandler } from 'src/application/commands/add-account/add-account.command-handler';
import { FindBankAccountQueryHandler } from './find-bank-account.query-handler';
import { OpenAccountCommandHandlerFixture } from 'src/application/commands/open-account/open-account.command-handler.integration.spec';
import { AddAccountCommand } from 'src/application/commands/add-account/add-account-command';
import { BankAccountStatus } from 'src/domain/entities/bank-account/bank-account';

describe('FindBankAccountQueryHandler', () => {
  const containers = IntegrationTestHelpers.setupTestContainer();
  let sut: FindBankAccountQueryHandler;
  let testingModule: TestingModule;
  let openAccountCommandHandler: OpenAccountCommandHandler;
  let addAccountCommandHandler: AddAccountCommandHandler;
  let sequelize: Sequelize;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [...IntegrationTestHelpers.registerDefaultModules()],
      providers: [
        FindBankAccountQueryHandler,
        AddAccountCommandHandler,
        OpenAccountCommandHandler,
        ChangeBankAccountStatusCommandHandler,
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
    sut = await mod.get(FindBankAccountQueryHandler);
    sequelize = mod.get(Sequelize);
    openAccountCommandHandler = mod.get(OpenAccountCommandHandler);
    addAccountCommandHandler = mod.get(AddAccountCommandHandler);
    testingModule = mod;
  });

  afterEach(async () => {
    await containers.postgreSqlContainer.stop();
    await testingModule.close();
  });

  test('Ao buscar uma conta bancária que não existe, uma erro deve ser retornado', async () => {
    await expect(sut.execute({ id: uuidv7() })).rejects.toThrow(
      'Conta bancária não encontrada',
    );
  });

  test('Dada uma conta bancária existente e sem movimentação, deve ser possível retornar os dados da conta bancária', async () => {
    const input = OpenAccountCommandHandlerFixture.openAccountCommand();
    const { id: customerId } = await openAccountCommandHandler.execute(input);
    const { id } = await addAccountCommandHandler.execute(
      new AddAccountCommand(customerId),
    );

    const result = await sut.execute({ id });

    expect(result).toMatchObject({
      id,
      status: BankAccountStatus.Active,
      customer: {
        id: customerId,
        fullName: input.fullName,
        document: input.document,
      },
      transactions: [],
    });
  });

  test.todo(
    'Dada uma conta bancária existente e com movimentação, deve ser possível retornar os dados da conta bancária',
  );
});
