import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();

      if (typeof exResponse === 'string') {
        message = exResponse;
        error = exception.message;
      } else if (typeof exResponse === 'object') {
        const resp = exResponse as any;
        message = resp.message || exception.message;
        error = resp.error || exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        {
          path: request.url,
          method: request.method,
          error: exception.message,
          stack: exception.stack,
        },
        'Unhandled exception',
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
