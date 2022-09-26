import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Response } from 'express';
import { MongoError } from 'mongodb';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const error = exception.getResponse() as {
      message: string;
      status: string;
    };

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(error?.message)
        ? error?.message[0]
        : error?.message,
      timestamp: new Date().toISOString(),
    });
  }
}

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.code;

    switch (status) {
      case 11000:
        const err = exception as unknown as { keyPattern: string };
        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: `${Object.keys(err.keyPattern)[0]} already exist`,
          timestamp: new Date().toISOString(),
        });
    }
  }
}

@Catch(WsException, HttpException)
export class AllExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}
