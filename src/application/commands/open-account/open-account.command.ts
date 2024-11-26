export class OpenAccountCommand {
  constructor(
    readonly fullName: string,
    readonly document: string,
    readonly birthDate: Date,
  ) {}
}
