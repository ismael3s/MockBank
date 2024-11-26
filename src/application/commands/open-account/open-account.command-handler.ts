import { IUnitOfWork } from 'src/application/abstractions/iunit-of-work.interface';
import { IBankAccountRepository } from 'src/domain/entities/bank-account/ibank-account.repository.interface';
import { Customer } from 'src/domain/entities/customer/customer';
import { ICustomerRepository } from 'src/domain/entities/customer/icustomer.repository.interface';
import { OpenAccountCommand } from './open-account.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UnitOfWork } from 'src/infra/persistence/sequelize/unit-of-work';

@CommandHandler(OpenAccountCommand)
export class OpenAccountCommandHandler
  implements ICommandHandler<OpenAccountCommand, { id: string }>
{
  constructor(
    @Inject('UnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
    @Inject('CustomerRepository')
    private readonly customerRepository: ICustomerRepository,
    @Inject('BankAccountRepository')
    private readonly bankAccountRepository: IBankAccountRepository,
  ) {}

  async execute(input: OpenAccountCommand): Promise<{ id: string }> {
    const customer = Customer.create(
      input.fullName,
      input.document,
      input.birthDate,
    );
    await this.unitOfWork.transaction(async () => {
      const customerAlreadyHaveAnAccount =
        await this.customerRepository.existsByDocument(customer.getDocument());
      if (customerAlreadyHaveAnAccount)
        throw new Error('O cliente já possui uma conta');
      await this.customerRepository.create(customer);
      for (const bankAccount of customer.getBankAccounts()) {
        await this.bankAccountRepository.create(bankAccount);
      }
    });
    return { id: customer.id };
  }
}
