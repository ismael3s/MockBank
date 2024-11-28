export class ApplicationError extends Error {
  public readonly statusCode: number = 400;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}
