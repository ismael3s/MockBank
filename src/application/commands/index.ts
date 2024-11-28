import { AddAccountCommandHandler } from './add-account/add-account.command-handler';
import { ChangeBankAccountStatusCommandHandler } from './change-bank-account-status/change-bank-account-status.command-handler';
import { DepositInBankAccountCommandHandler } from './deposit-in-bank-account/deposit-in-bank-account.command-handler';
import { OpenAccountCommandHandler } from './open-account/open-account.command-handler';
import { TransferToBankAccountCommandHandler } from './transfer-to-bank-account/transfer-to-bank-account.command-handler';
import { WithdrawFromBankAccountCommandHandler } from './withdraw-from-bank-account/withdraw-from-bank-account.command-handler';

export const CommandHandlers = [
  OpenAccountCommandHandler,
  AddAccountCommandHandler,
  ChangeBankAccountStatusCommandHandler,
  WithdrawFromBankAccountCommandHandler,
  DepositInBankAccountCommandHandler,
  TransferToBankAccountCommandHandler,
];
