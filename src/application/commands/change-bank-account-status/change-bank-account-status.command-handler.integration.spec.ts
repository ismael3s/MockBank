import { IntegrationTestHelpers } from 'src/modules/shared/test-helpers/integration/setup-test-container';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { UnitOfWork } from 'src/infra/persistence/sequelize/unit-of-work';
import { CustomerRepository } from 'src/infra/persistence/sequelize/repositories/customer.repository';
import { BankAccountRepository } from 'src/infra/persistence/sequelize/repositories/bank-account-repository';
import { uuidv7 } from 'uuidv7';
import { OpenAccountCommandHandler } from '../open-account/open-account.command-handler';
import { OpenAccountCommandHandlerFixture } from '../open-account/open-account.command-handler.integration.spec';
import { ChangeBankAccountStatusCommandHandler } from './change-bank-account-status.command-handler';
import { AddAccountCommandHandler } from '../add-account/add-account.command-handler';
import { AddAccountCommand } from '../add-account/add-account-command';

describe('ChangeBankAccountStatusCommandHandler', () => {
  const containers = IntegrationTestHelpers.setupTestContainer();
  let sut: ChangeBankAccountStatusCommandHandler;
  let testingModule: TestingModule;
  let openAccountCommandHandler: OpenAccountCommandHandler;
  let addAccountCommandHandler: AddAccountCommandHandler;
  let sequelize: Sequelize;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [...IntegrationTestHelpers.registerDefaultModules()],
      providers: [
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
    sut = await mod.get(ChangeBankAccountStatusCommandHandler);
    sequelize = mod.get(Sequelize);
    openAccountCommandHandler = mod.get(OpenAccountCommandHandler);
    addAccountCommandHandler = mod.get(AddAccountCommandHandler);
    testingModule = mod;
  });

  afterEach(async () => {
    await containers.postgreSqlContainer.stop();
    await testingModule.close();
  });

  test('Não deve ser possível alterar o status de uma conta bancária inexistente', async () => {
    await expect(
      sut.execute({ id: uuidv7(), status: 'active' }),
    ).rejects.toThrow('Conta bancária não encontrada');
  });

  test('Deve ser possível desativar uma conta bancaria ativa', async () => {
    const input = OpenAccountCommandHandlerFixture.openAccountCommand();
    const { id: customerId } = await openAccountCommandHandler.execute(input);
    const { id } = await addAccountCommandHandler.execute(
      new AddAccountCommand(customerId),
    );

    await sut.execute({ id, status: 'inactive' });

    const [[untypedResult]] = await sequelize.query(
      'select status from bank_accounts where id = :id',
      {
        replacements: { id },
      },
    );
    const result = untypedResult as { status: string };
    expect(result.status).toBe('inactive');
  });
});
