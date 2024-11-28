import { fakerPT_BR } from '@faker-js/faker/.';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { BankAccountStatus } from 'src/domain/entities/bank-account/bank-account';
import { CustomerTestFixture } from 'src/domain/entities/bank-account/bank-account.unit.spec';
import { CustomerRepository } from 'src/infra/persistence/sequelize/repositories/customer.repository';
import { BankAccountRepository } from 'src/infra/persistence/sequelize/repositories/bank-account-repository';
import { UnitOfWork } from 'src/infra/persistence/sequelize/unit-of-work';
import { IntegrationTestHelpers } from 'src/infra/test-helpers/integration/setup-test-container';
import { OpenAccountCommand } from './open-account.command';
import { OpenAccountCommandHandler } from './open-account.command-handler';

describe('OpenAccountCommandHandler', () => {
  const containers = IntegrationTestHelpers.setupTestContainer();
  let sut: OpenAccountCommandHandler;
  let testingModule: TestingModule;
  let sequelize: Sequelize;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [...IntegrationTestHelpers.registerDefaultModules()],
      providers: [
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
    sut = await mod.get(OpenAccountCommandHandler);
    sequelize = mod.get(Sequelize);

    testingModule = mod;
  });

  afterEach(async () => {
    await containers.postgreSqlContainer.stop();
    await testingModule.close();
  });

  test('Quando um cliente é cadastro com dados validos, o seu cadastro deve ser feito junto com uma conta bancária ativa e com saldo zerado', async () => {
    const input = OpenAccountCommandHandlerFixture.openAccountCommand();

    await sut.execute(input);

    const [[clientResult]] = await sequelize.query(
      'select id, full_name, document from customers',
    );
    const result = clientResult as any;
    expect(result.full_name).toBe(input.fullName);
    expect(result.document).toBe(input.document);
    expect(result.id).toBeDefined();

    const [[bankAccountResult]] = await sequelize.query(
      'select id, customer_id, status from bank_accounts',
    );
    const bankAccount = bankAccountResult as any;
    expect(bankAccount.customer_id).toBe(result.id);
    expect(bankAccount.status).toBe(BankAccountStatus.Active);
    expect(bankAccount.id).toBeDefined();
  });

  test('Quando existe a tentativa de abrir uma conta com um documento já cadastrado, deve ser lançado um erro', async () => {
    const input = OpenAccountCommandHandlerFixture.openAccountCommand();

    await sut.execute(input);

    await expect(sut.execute(input)).rejects.toThrow(
      'O cliente já possui uma conta',
    );
  });
});

export class OpenAccountCommandHandlerFixture {
  static openAccountCommand() {
    return new OpenAccountCommand(
      fakerPT_BR.person.fullName(),
      CustomerTestFixture.generateValidCPF(),
      fakerPT_BR.date.past({ years: 18 }),
    );
  }
}
