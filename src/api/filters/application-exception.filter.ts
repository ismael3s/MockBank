import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { ApplicationError } from 'src/domain/exceptions/application-exception';

@Catch(ApplicationError)
export class ApplicationExceptionFilter implements ExceptionFilter {
  catch(exception: ApplicationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.statusCode || 400;

    return response.status(status).json({
      statusCode: status,
      error: 'Bad Request',
      message: [exception.message],
    });
  }
}
