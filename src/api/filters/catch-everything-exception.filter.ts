import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost,
    private readonly logger: LoggerService,
  ) {}

  catch(exception: Error, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    this.logger.error('An unexpected error occurred', {
      exception: exception.message,
      stack: exception.stack,
    });
    const responseBody = {
      statusCode: httpStatus,
      error: 'Internal Server Error',
      message: [
        'Aconteceu um erro inesperado no servidor',
        'Por favor, tente novamente mais tarde',
      ],
    };
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
