import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ICustomerRepository } from 'src/domain/entities/customer/icustomer.repository.interface';
import { FindCustomerQuery } from './find-customer-query';
import { ApplicationError } from 'src/domain/exceptions/application-exception';

@QueryHandler(FindCustomerQuery)
export class FindCustomerQueryHandler
  implements IQueryHandler<FindCustomerQuery>
{
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(query: FindCustomerQuery): Promise<any> {
    const customer = await this.customerRepository.findById(query.id);
    if (!customer) throw new ApplicationError('Cliente não encontrado');
    return new FindCustomerQueryOutput(
      customer.id,
      customer.getFullName().value,
      customer.getDocument().value,
      customer.getBirthDate(),
      customer.getBankAccounts().map((account) => {
        return new BankAccountOutput(
          account.id,
          account.getNumber().value,
          account.getStatus(),
        );
      }),
    );
  }
}

export class FindCustomerQueryOutput {
  constructor(
    public id: string,
    public fullName: string,
    public document: string,
    public birthDate: Date,
    public bankAccounts: Array<BankAccountOutput> = [],
  ) {}
}

class BankAccountOutput {
  constructor(
    public id: string,
    public number: string,
    public status: string,
  ) {}
}
