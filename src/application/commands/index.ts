import { AddAccountCommandHandler } from './add-account/add-account.command-handler';
import { ChangeBankAccountStatusCommandHandler } from './change-bank-account-status/change-bank-account-status.command-handler';
import { OpenAccountCommandHandler } from './open-account/open-account.command-handler';

export const CommandHandlers = [
  OpenAccountCommandHandler,
  AddAccountCommandHandler,
  ChangeBankAccountStatusCommandHandler,
];
