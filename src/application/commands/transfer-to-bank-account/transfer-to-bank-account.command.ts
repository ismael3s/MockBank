export class TransferToBankAccountCommand {
  constructor(
    public readonly from: string,
    public readonly to: string,
    public readonly amount: number,
  ) {}
}
