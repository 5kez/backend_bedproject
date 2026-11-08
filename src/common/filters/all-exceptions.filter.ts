import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Deleting a row that other rows still reference (a building with wards,
    // a site with buildings, ...) used to surface as a bare 500.
    const dbCode = (exception as { code?: string } | null)?.code;
    const inUse =
      dbCode === 'ER_ROW_IS_REFERENCED_2' || dbCode === 'ER_ROW_IS_REFERENCED';

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : inUse
          ? HttpStatus.CONFLICT
          : HttpStatus.INTERNAL_SERVER_ERROR;

    const body =
      exception instanceof HttpException
        ? exception.getResponse()
        : inUse
          ? {
              statusCode: status,
              message: 'ไม่สามารถลบได้ เนื่องจากยังมีข้อมูลอื่นเชื่อมโยงอยู่',
            }
          : { statusCode: status, message: 'Internal server error' };

    const message =
      exception instanceof Error ? exception.message : String(exception);
    const stack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(
      `${request.method} ${request.url} -> ${status}: ${message}`,
      stack,
    );

    response.status(status).json(
      typeof body === 'object'
        ? { ...body, path: request.url, timestamp: new Date().toISOString() }
        : {
            message: body,
            path: request.url,
            timestamp: new Date().toISOString(),
          },
    );
  }
}
