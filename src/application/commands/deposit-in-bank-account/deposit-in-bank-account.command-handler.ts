import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IUnitOfWork } from 'src/application/abstractions/iunit-of-work.interface';
import { IBankAccountRepository } from 'src/domain/entities/bank-account/ibank-account.repository.interface';
import { TransactionDomainService } from 'src/domain/services/transaction.domain-service';
import { DepositInBankAccountCommand } from './deposit-in-bank-account-command';

@CommandHandler(DepositInBankAccountCommand)
export class DepositInBankAccountCommandHandler
  implements ICommandHandler<DepositInBankAccountCommand, { id: string }>
{
  constructor(
    @Inject('UnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
    @Inject('BankAccountRepository')
    private readonly bankAccountRepository: IBankAccountRepository,
  ) {}

  async execute(
    command: DepositInBankAccountCommand,
  ): Promise<{ id: string; balance: number }> {
    return this.unitOfWork.transaction(async () => {
      const bankAccount = await this.bankAccountRepository.findById(
        command.accountId,
      );
      if (!bankAccount) throw new Error('Conta bancária não encontrada');
      TransactionDomainService.deposit(bankAccount, command.amount);
      await this.bankAccountRepository.update(bankAccount);
      return {
        id: bankAccount.getLastTransaction().id,
        balance: bankAccount.getBalance(),
      };
    });
  }
}
