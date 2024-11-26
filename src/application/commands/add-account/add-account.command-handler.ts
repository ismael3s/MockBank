import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IUnitOfWork } from 'src/application/abstractions/iunit-of-work.interface';
import { IBankAccountRepository } from 'src/domain/entities/bank-account/ibank-account.repository.interface';
import { ICustomerRepository } from 'src/domain/entities/customer/icustomer.repository.interface';
import { AddAccountCommand } from './add-account-command';
import { Inject } from '@nestjs/common';

type Output = {
  id: string;
};

@CommandHandler(AddAccountCommand)
export class AddAccountCommandHandler
  implements ICommandHandler<AddAccountCommand, Output>
{
  constructor(
    @Inject('UnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
    @Inject('CustomerRepository')
    private readonly customerRepository: ICustomerRepository,
    @Inject('BankAccountRepository')
    private readonly bankAccountRepository: IBankAccountRepository,
  ) {}

  async execute(command: AddAccountCommand): Promise<Output> {
    const output = await this.unitOfWork.transaction(async () => {
      const customer = await this.customerRepository.findById(
        command.customerId,
      );
      if (!customer) throw new Error('Cliente não encontrado');
      const bankAccount = customer.addBankAccount();
      await this.bankAccountRepository.create(bankAccount);
      return { id: bankAccount.id };
    });
    return output;
  }
}
