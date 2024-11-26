import { IntegrationTestHelpers } from 'src/modules/shared/test-helpers/integration/setup-test-container';
import { AddAccountCommandHandler } from './add-account.command-handler';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { UnitOfWork } from 'src/infra/persistence/sequelize/unit-of-work';
import {
  BankAccountRepository,
  CustomerRepository,
} from 'src/infra/persistence/sequelize/repositories/customer.repository';
import { uuidv7 } from 'uuidv7';
import { OpenAccountCommandHandler } from '../open-account/open-account.command-handler';
import { OpenAccountCommandHandlerFixture } from '../open-account/open-account.command-handler.integration.spec';
import { AddAccountCommand } from './add-account-command';

describe('AddAccountCommandHandler', () => {
  const containers = IntegrationTestHelpers.setupTestContainer();
  let sut: AddAccountCommandHandler;
  let testingModule: TestingModule;
  let openAccountCommandHandler: OpenAccountCommandHandler;
  let sequelize: Sequelize;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [...IntegrationTestHelpers.registerDefaultModules()],
      providers: [
        AddAccountCommandHandler,
        OpenAccountCommandHandler,
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
    sut = await mod.get(AddAccountCommandHandler);
    sequelize = mod.get(Sequelize);
    openAccountCommandHandler = mod.get(OpenAccountCommandHandler);

    testingModule = mod;
  });

  afterEach(async () => {
    await containers.postgreSqlContainer.stop();
    await testingModule.close();
  });

  test('Não deve ser possível adicionar uma conta para um cliente inexistente', async () => {
    await expect(sut.execute({ customerId: uuidv7() })).rejects.toThrow(
      'Cliente não encontrado',
    );
  });

  test('Deve ser possivel adicionar uma conta para um cliente existente', async () => {
    const input = OpenAccountCommandHandlerFixture.openAccountCommand();
    const { id } = await openAccountCommandHandler.execute(input);

    const output = await sut.execute(new AddAccountCommand(id));

    expect(output.id).toBeDefined();
    const [[untypedResult]] = await sequelize.query(
      'select count(*) from bank_accounts where customer_id = :customerId',
      {
        replacements: { customerId: id },
      },
    );
    const result = untypedResult as { count: string };
    expect(result.count).toBe('2');
  });
});
