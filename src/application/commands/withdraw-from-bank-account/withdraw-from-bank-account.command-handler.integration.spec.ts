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
import { ChangeBankAccountStatusCommandHandler } from '../change-bank-account-status/change-bank-account-status.command-handler';
import { OpenAccountCommandHandlerFixture } from '../open-account/open-account.command-handler.integration.spec';
import { AddAccountCommand } from '../add-account/add-account-command';
import { TransactionType } from 'src/domain/entities/bank-account/transaction';
import { WithdrawFromBankAccountCommandHandler } from './withdraw-from-bank-account.command-handler';
import { DepositInBankAccountCommandHandler } from '../deposit-in-bank-account/deposit-in-bank-account.command-handler';

describe('DepositInBankAccountCommandHandler', () => {
  const containers = IntegrationTestHelpers.setupTestContainer();
  let sut: WithdrawFromBankAccountCommandHandler;
  let depositInBankAccountCommandHandler: DepositInBankAccountCommandHandler;
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
        WithdrawFromBankAccountCommandHandler,
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
    sut = await mod.get(WithdrawFromBankAccountCommandHandler);
    sequelize = mod.get(Sequelize);
    openAccountCommandHandler = mod.get(OpenAccountCommandHandler);
    addAccountCommandHandler = mod.get(AddAccountCommandHandler);
    depositInBankAccountCommandHandler = mod.get(
      DepositInBankAccountCommandHandler,
    );
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

  test('Dado uma conta bancaria ativa e com saldo, deve ser possível realizar um saque', async () => {
    const input = OpenAccountCommandHandlerFixture.openAccountCommand();
    const { id: customerId } = await openAccountCommandHandler.execute(input);
    const { id: bankAccountId } = await addAccountCommandHandler.execute(
      new AddAccountCommand(customerId),
    );
    await depositInBankAccountCommandHandler.execute({
      accountId: bankAccountId,
      amount: 200,
    });

    const { id, balance } = await sut.execute({
      accountId: bankAccountId,
      amount: 50,
    });

    expect(balance).toBe(150);
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
      type: TransactionType.Withdraw,
      amount: '50',
      from_bank_account_id: bankAccountId,
      to_bank_account_id: null,
    });
  });
});
