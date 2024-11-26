export class ChangeBankAccountStatusCommand {
  constructor(
    public readonly id: string,
    public readonly status: 'active' | 'inactive',
  ) {}
}
