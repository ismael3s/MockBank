import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // TODO: add logger
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
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
