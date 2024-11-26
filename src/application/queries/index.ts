import { FindBankAccountQueryHandler } from './find-bank-account/find-bank-account.query-handler';
import { FindCustomerQueryHandler } from './find-customer/find-customer.query-handler';

export const QueriesHandlers = [
  FindCustomerQueryHandler,
  FindBankAccountQueryHandler,
];
