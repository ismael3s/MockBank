export class WithdrawFromBankAccountCommand {
  constructor(
    public readonly accountId: string,
    public readonly amount: number,
  ) {}
}
