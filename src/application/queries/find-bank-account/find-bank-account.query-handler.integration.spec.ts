import { IntegrationTestHelpers } from 'src/infra/test-helpers/integration/setup-test-container';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { UnitOfWork } from 'src/infra/persistence/sequelize/unit-of-work';
import { CustomerRepository } from 'src/infra/persistence/sequelize/repositories/customer.repository';
import { BankAccountRepository } from 'src/infra/persistence/sequelize/repositories/bank-account-repository';
import { uuidv7 } from 'uuidv7';
import { ChangeBankAccountStatusCommandHandler } from 'src/application/commands/change-bank-account-status/change-bank-account-status.command-handler';
import { OpenAccountCommandHandler } from 'src/application/commands/open-account/open-account.command-handler';
import { AddAccountCommandHandler } from 'src/application/commands/add-account/add-account.command-handler';
import { FindBankAccountQueryHandler } from './find-bank-account.query-handler';
import { OpenAccountCommandHandlerFixture } from 'src/application/commands/open-account/open-account.command-handler.integration.spec';
import { AddAccountCommand } from 'src/application/commands/add-account/add-account-command';
import { BankAccountStatus } from 'src/domain/entities/bank-account/bank-account';
import { DepositInBankAccountCommandHandler } from 'src/application/commands/deposit-in-bank-account/deposit-in-bank-account.command-handler';
import { WithdrawFromBankAccountCommandHandler } from 'src/application/commands/withdraw-from-bank-account/withdraw-from-bank-account.command-handler';
import { TransferToBankAccountTestFixture } from 'src/application/commands/transfer-to-bank-account/transfer-to-bank-account.command-handler.integration.spec';
import { TransferToBankAccountCommandHandler } from 'src/application/commands/transfer-to-bank-account/transfer-to-bank-account.command-handler';

describe('FindBankAccountQueryHandler', () => {
  const containers = IntegrationTestHelpers.setupTestContainer();
  let sut: FindBankAccountQueryHandler;
  let testingModule: TestingModule;
  let openAccountCommandHandler: OpenAccountCommandHandler;
  let addAccountCommandHandler: AddAccountCommandHandler;
  let depositInBankAccountCommandHandler: DepositInBankAccountCommandHandler;
  let withdrawFromBankAccountCommandHandler: WithdrawFromBankAccountCommandHandler;
  let transferToBankAccountCommandHandler: TransferToBankAccountCommandHandler;
  let sequelize: Sequelize;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [...IntegrationTestHelpers.registerDefaultModules()],
      providers: [
        FindBankAccountQueryHandler,
        AddAccountCommandHandler,
        OpenAccountCommandHandler,
        ChangeBankAccountStatusCommandHandler,
        DepositInBankAccountCommandHandler,
        WithdrawFromBankAccountCommandHandler,
        TransferToBankAccountCommandHandler,
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
    depositInBankAccountCommandHandler = mod.get(
      DepositInBankAccountCommandHandler,
    );
    withdrawFromBankAccountCommandHandler = mod.get(
      WithdrawFromBankAccountCommandHandler,
    );
    transferToBankAccountCommandHandler = mod.get(
      TransferToBankAccountCommandHandler,
    );
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

  test('Dada uma conta bancária existente e com movimentação, deve ser possível retornar os dados da conta bancária', async () => {
    const input = OpenAccountCommandHandlerFixture.openAccountCommand();
    const { id: customerId } = await openAccountCommandHandler.execute(input);
    const { id: originBankAccountId } = await addAccountCommandHandler.execute(
      new AddAccountCommand(customerId),
    );
    await depositInBankAccountCommandHandler.execute({
      accountId: originBankAccountId,
      amount: 5000,
    });
    await withdrawFromBankAccountCommandHandler.execute({
      accountId: originBankAccountId,
      amount: 2000,
    });
    const { bankAccountId: anotherBankAccountId } =
      await TransferToBankAccountTestFixture.createAccountWithBalance({
        addAccountCommandHandler,
        depositInBankAccountCommandHandler,
        openAccountCommandHandler,
        balance: 200,
      });
    await transferToBankAccountCommandHandler.execute({
      amount: 1000,
      from: originBankAccountId,
      to: anotherBankAccountId,
    });
    await transferToBankAccountCommandHandler.execute({
      amount: 500,
      from: anotherBankAccountId,
      to: originBankAccountId,
    });

    const result = await sut.execute({ id: originBankAccountId });

    expect(result).toMatchObject({
      id: originBankAccountId,
      status: BankAccountStatus.Active,
      balance: 2500,
      customer: {
        id: customerId,
        fullName: input.fullName,
        document: input.document,
      },
      transactions: expect.arrayContaining([
        {
          id: expect.any(String),
          amount: 500,
          type: 'transfer',
          createdAt: expect.any(Date),
          toAccountId: originBankAccountId,
        },
        {
          id: expect.any(String),
          amount: 1000,
          type: 'transfer',
          createdAt: expect.any(Date),
          toAccountId: anotherBankAccountId,
        },
        {
          id: expect.any(String),
          amount: 2000,
          type: 'withdraw',
          createdAt: expect.any(Date),
          toAccountId: null,
        },
        {
          id: expect.any(String),
          amount: 5000,
          type: 'deposit',
          createdAt: expect.any(Date),
          toAccountId: null,
        },
      ]),
    });
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
});
