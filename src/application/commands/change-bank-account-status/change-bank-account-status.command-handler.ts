import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IUnitOfWork } from 'src/application/abstractions/iunit-of-work.interface';
import { IBankAccountRepository } from 'src/domain/entities/bank-account/ibank-account.repository.interface';
import { ChangeBankAccountStatusCommand } from './change-bank-account-status-command';
import { ApplicationError } from 'src/domain/exceptions/application-exception';

@CommandHandler(ChangeBankAccountStatusCommand)
export class ChangeBankAccountStatusCommandHandler
  implements ICommandHandler<ChangeBankAccountStatusCommand>
{
  constructor(
    @Inject('UnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
    @Inject('BankAccountRepository')
    private readonly bankAccountRepository: IBankAccountRepository,
  ) {}

  async execute(command: ChangeBankAccountStatusCommand): Promise<void> {
    await this.unitOfWork.transaction(async () => {
      const bankAccount = await this.bankAccountRepository.findById(command.id);
      if (!bankAccount)
        throw new ApplicationError('Conta bancária não encontrada');
      if (command.status === 'active') {
        bankAccount.active();
      } else {
        bankAccount.inactivate();
      }
      await this.bankAccountRepository.update(bankAccount);
    });
  }
}
