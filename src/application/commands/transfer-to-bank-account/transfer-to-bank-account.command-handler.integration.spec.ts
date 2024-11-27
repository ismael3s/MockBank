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
import { DepositInBankAccountCommandHandler } from '../deposit-in-bank-account/deposit-in-bank-account.command-handler';
import { TransferToBankAccountCommandHandler } from './transfer-to-bank-account.command-handler';

describe('TransferToBankAccountCommandHandler', () => {
  const containers = IntegrationTestHelpers.setupTestContainer();
  let sut: TransferToBankAccountCommandHandler;
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
    sut = await mod.get(TransferToBankAccountCommandHandler);
    sequelize = mod.get(Sequelize);
    openAccountCommandHandler = mod.get(OpenAccountCommandHandler);
    addAccountCommandHandler = mod.get(AddAccountCommandHandler);
    depositInBankAccountCommandHandler = mod.get(
      DepositInBankAccountCommandHandler,
    );
    testingModule = mod;
  });

  afterEach(async () => {
    await testingModule.close();
  });

  test('Ao tentar realizar uma transferência para a mesma conta, deve lançar uma exceção', async () => {
    const { bankAccountId } =
      await TransferToBankAccountTestFixture.createAccountWithBalance({
        addAccountCommandHandler,
        depositInBankAccountCommandHandler,
        openAccountCommandHandler,
        balance: 200,
      });

    await expect(
      sut.execute({
        amount: 200,
        from: bankAccountId,
        to: bankAccountId,
      }),
    ).rejects.toThrow(
      'Não é possível realizar transferências para a mesma conta',
    );
  });

  test('Dado duas contas bancarias ativas, distintas e com saldo, deve ser possível realizar  uma transferência  entre elas', async () => {
    const { bankAccountId: fromBankAccountId } =
      await TransferToBankAccountTestFixture.createAccountWithBalance({
        addAccountCommandHandler,
        depositInBankAccountCommandHandler,
        openAccountCommandHandler,
        balance: 200,
      });
    const { bankAccountId: toBankAccountId } =
      await TransferToBankAccountTestFixture.createAccountWithBalance({
        addAccountCommandHandler,
        depositInBankAccountCommandHandler,
        openAccountCommandHandler,
        balance: 1,
      });

    const { id, balance } = await sut.execute({
      amount: 200,
      from: fromBankAccountId,
      to: toBankAccountId,
    });

    expect(balance).toBe(0);
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
      type: TransactionType.Transfer,
      amount: '200',
      from_bank_account_id: fromBankAccountId,
      to_bank_account_id: toBankAccountId,
    });
  });

  test('Dado duas contas bancarias ativas, distintas e com saldo, quando apenas a ultima atualização de dados na base der erro, deve ser desfeito qualquer alteração feita na base', async () => {
    //  mock only the second call tot he bank account repository .update
    const { bankAccountId: fromBankAccountId } =
      await TransferToBankAccountTestFixture.createAccountWithBalance({
        addAccountCommandHandler,
        depositInBankAccountCommandHandler,
        openAccountCommandHandler,
        balance: 200,
      });
    const { bankAccountId: toBankAccountId } =
      await TransferToBankAccountTestFixture.createAccountWithBalance({
        addAccountCommandHandler,
        depositInBankAccountCommandHandler,
        openAccountCommandHandler,
        balance: 0,
      });
    const bankAccountRepository = testingModule.get('BankAccountRepository');
    const update = bankAccountRepository.update;
    let callCount = 0;
    jest
      .spyOn(bankAccountRepository, 'update')
      .mockImplementation(function (bank) {
        callCount++;
        if (callCount === 2) {
          throw new Error('Erro ao atualizar a conta bancária');
        }
        return update.call(bankAccountRepository, bank);
      });

    await expect(
      sut.execute({
        amount: 200,
        from: fromBankAccountId,
        to: toBankAccountId,
      }),
    ).rejects.toThrow();

    const [[lastTransferTransaction]] = await sequelize.query(
      `select id, type, amount, from_bank_account_id, to_bank_account_id
                  from transactions
                  where type = :type
                  order by created_at desc
                  limit 1
              `,
      {
        replacements: { type: TransactionType.Transfer },
      },
    );
    expect(lastTransferTransaction).toBeUndefined();
  });
});

export class TransferToBankAccountTestFixture {
  static async createAccountWithBalance({
    openAccountCommandHandler,
    addAccountCommandHandler,
    depositInBankAccountCommandHandler,
    balance = 200,
  }) {
    const input = OpenAccountCommandHandlerFixture.openAccountCommand();
    const { id: customerId } = await openAccountCommandHandler.execute(input);
    const { id: bankAccountId } = await addAccountCommandHandler.execute(
      new AddAccountCommand(customerId),
    );
    if (balance > 0) {
      await depositInBankAccountCommandHandler.execute({
        accountId: bankAccountId,
        amount: balance,
      });
    }

    return { bankAccountId };
  }
}
