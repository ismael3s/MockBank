import { IntegrationTestHelpers } from 'src/modules/shared/test-helpers/integration/setup-test-container';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { UnitOfWork } from 'src/infra/persistence/sequelize/unit-of-work';
import {
  BankAccountRepository,
  CustomerRepository,
} from 'src/infra/persistence/sequelize/repositories/customer.repository';
import { uuidv7 } from 'uuidv7';
import { OpenAccountCommandHandler } from '../open-account/open-account.command-handler';
import { AddAccountCommandHandler } from '../add-account/add-account.command-handler';
import { DepositInBankAccountCommandHandler } from './deposit-in-bank-account.command-handler';
import { ChangeBankAccountStatusCommandHandler } from '../change-bank-account-status/change-bank-account-status.command-handler';
import { OpenAccountCommandHandlerFixture } from '../open-account/open-account.command-handler.integration.spec';
import { AddAccountCommand } from '../add-account/add-account-command';
import { TransactionType } from 'src/domain/entities/bank-account/transaction';

describe('DepositInBankAccountCommandHandler', () => {
  const containers = IntegrationTestHelpers.setupTestContainer();
  let sut: DepositInBankAccountCommandHandler;
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
        DepositInBankAccountCommandHandler,
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
    sut = await mod.get(DepositInBankAccountCommandHandler);
    sequelize = mod.get(Sequelize);
    openAccountCommandHandler = mod.get(OpenAccountCommandHandler);
    addAccountCommandHandler = mod.get(AddAccountCommandHandler);
    testingModule = mod;
  });

  afterEach(async () => {
    await containers.postgreSqlContainer.stop();
    await testingModule.close();
  });

  test('Não deve ser possível realizar um deposito em uma conta inexistente', async () => {
    await expect(
      sut.execute({ accountId: uuidv7(), amount: 2000 }),
    ).rejects.toThrow('Conta bancária não encontrada');
  });

  test('Dado uma conta bancaria ativa, deve ser possível realizar um deposito', async () => {
    const input = OpenAccountCommandHandlerFixture.openAccountCommand();
    const { id: customerId } = await openAccountCommandHandler.execute(input);
    const { id: bankAccountId } = await addAccountCommandHandler.execute(
      new AddAccountCommand(customerId),
    );

    const { balance, id } = await sut.execute({
      accountId: bankAccountId,
      amount: 200,
    });

    expect(balance).toBe(200);
    const [[untypedResult]] = await sequelize.query(
      `select id, type, amount, from_bank_account_id, to_bank_account_id
            from transactions
            where from_bank_account_id = :bankAccountId
        `,
      {
        replacements: { bankAccountId },
      },
    );
    const result = untypedResult as {
      id: string;
      type: string;
      amount: number;
      from_bank_account_id: string;
      to_bank_account_id?: string;
    };
    expect(result).toMatchObject({
      id,
      type: TransactionType.Deposit,
      amount: '200',
      from_bank_account_id: bankAccountId,
      to_bank_account_id: null,
    });
  });

  test('Dado uma conta bancaria ativa, deve ser possível realizar um deposito 2', async () => {
    const input = OpenAccountCommandHandlerFixture.openAccountCommand();
    const { id: customerId } = await openAccountCommandHandler.execute(input);
    const { id: bankAccountId } = await addAccountCommandHandler.execute(
      new AddAccountCommand(customerId),
    );

    await sut.execute({
      accountId: bankAccountId,
      amount: 200,
    });
    const { balance, id } = await sut.execute({
      accountId: bankAccountId,
      amount: 200,
    });

    expect(balance).toBe(400);
    const [[untypedResult]] = await sequelize.query(
      `select id, type, amount, from_bank_account_id, to_bank_account_id
            from transactions
            where id = :id
        `,
      {
        replacements: { id },
      },
    );
    const result = untypedResult as {
      id: string;
      type: string;
      amount: number;
      from_bank_account_id: string;
      to_bank_account_id?: string;
    };
    expect(result).toMatchObject({
      id,
      type: TransactionType.Deposit,
      amount: '200',
      from_bank_account_id: bankAccountId,
      to_bank_account_id: null,
    });
  });
});
