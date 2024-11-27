export class DepositInBankAccountCommand {
  constructor(
    public readonly accountId: string,
    public readonly amount: number,
  ) {}
}
