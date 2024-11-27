import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransferToBankAccountCommand } from './transfer-to-bank-account.command';
import { IUnitOfWork } from 'src/application/abstractions/iunit-of-work.interface';
import { Inject } from '@nestjs/common';
import { IBankAccountRepository } from 'src/domain/entities/bank-account/ibank-account.repository.interface';
import { TransactionDomainService } from 'src/domain/services/transaction.domain-service';

@CommandHandler(TransferToBankAccountCommand)
export class TransferToBankAccountCommandHandler
  implements ICommandHandler<TransferToBankAccountCommand>
{
  constructor(
    @Inject('UnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
    @Inject('BankAccountRepository')
    private readonly bankAccountRepository: IBankAccountRepository,
  ) {}

  async execute(command: TransferToBankAccountCommand) {
    return this.unitOfWork.transaction(async () => {
      const from = await this.bankAccountRepository.findById(command.from);
      if (!from) throw new Error('Conta de origem não encontrada');
      const to = await this.bankAccountRepository.findById(command.to);
      if (!to) throw new Error('Conta de destino não encontrada');
      TransactionDomainService.transfer(from, to, command.amount);
      await this.bankAccountRepository.update(from);
      await this.bankAccountRepository.update(to);
      return {
        id: from.getLastTransaction().id,
        balance: from.getBalance(),
      };
    });
  }
}
