import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IBankAccountRepository } from 'src/domain/entities/bank-account/ibank-account.repository.interface';
import { FindBankAccountQuery } from './find-bank-account-query';

@QueryHandler(FindBankAccountQuery)
export class FindBankAccountQueryHandler
  implements IQueryHandler<FindBankAccountQuery>
{
  constructor(
    @Inject('BankAccountRepository')
    private readonly bankAccountRepository: IBankAccountRepository,
  ) {}

  async execute(query: FindBankAccountQuery): Promise<Output> {
    const bankAccount = await this.bankAccountRepository.findById(query.id);
    if (!bankAccount) throw new Error('Conta bancária não encontrada');
    return {
      id: bankAccount.id,
      balance: bankAccount.getBalance(),
      status: bankAccount.getStatus(),
      customer: {
        id: bankAccount.getCustomer().id,
        fullName: bankAccount.getCustomer().getFullName().value,
        document: bankAccount.getCustomer().getDocument().value,
      },
      transactions: bankAccount.getTransactions().map((transaction) => ({
        id: transaction.id,
        amount: transaction.getAmount(),
        type: transaction.getType(),
        createdAt: transaction.getCreatedAt(),
        toAccountId: transaction.getTo(),
      })),
    };
  }
}

type Output = {
  id: string;
  balance: number;
  status: string;
  customer: {
    id: string;
    fullName: string;
    document: string;
  };
  transactions: {
    id: string;
    amount: number;
    type: string;
    toAccountId?: string;
    createdAt: Date;
  }[];
};
