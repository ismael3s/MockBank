import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { WithdrawFromBankAccountCommand } from './withdraw-from-bank-account.command';
import { IUnitOfWork } from 'src/application/abstractions/iunit-of-work.interface';
import { Inject } from '@nestjs/common';
import { TransactionDomainService } from 'src/domain/services/transaction.domain-service';
import { IBankAccountRepository } from 'src/domain/entities/bank-account/ibank-account.repository.interface';

@CommandHandler(WithdrawFromBankAccountCommand)
export class WithdrawFromBankAccountCommandHandler
  implements
    ICommandHandler<
      WithdrawFromBankAccountCommand,
      {
        id: string;
        balance: number;
      }
    >
{
  constructor(
    @Inject('UnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
    @Inject('BankAccountRepository')
    private readonly bankAccountRepository: IBankAccountRepository,
  ) {}

  async execute(
    command: WithdrawFromBankAccountCommand,
  ): Promise<{ id: string; balance: number }> {
    return this.unitOfWork.transaction(async () => {
      const bankAccount = await this.bankAccountRepository.findById(
        command.accountId,
      );
      if (!bankAccount) throw new Error('Conta bancária não encontrada');
      TransactionDomainService.withdraw(bankAccount, command.amount);
      await this.bankAccountRepository.update(bankAccount);
      return {
        id: bankAccount.getLastTransaction().id,
        balance: bankAccount.getBalance(),
      };
    });
  }
}
