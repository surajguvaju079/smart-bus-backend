import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export interface Controller {
  path: string;
  router: any;
}

export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
export enum ErrorCode {
  // Client Errors (4xx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  BAD_REQUEST = 'BAD_REQUEST',

  // Server Errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export class ServiceError {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number,
    public details?: any
  ) {}

  static notFound(message: string = 'Resource not found', details?: any): ServiceError {
    return new ServiceError(ErrorCode.NOT_FOUND, message, StatusCodes.NOT_FOUND, details);
  }

  static alreadyExists(message: string = 'Resource already exists', details?: any): ServiceError {
    return new ServiceError(ErrorCode.ALREADY_EXISTS, message, StatusCodes.CONFLICT, details);
  }

  static validationError(message: string = 'Validation failed', details?: any): ServiceError {
    return new ServiceError(ErrorCode.VALIDATION_ERROR, message, StatusCodes.BAD_REQUEST, details);
  }

  static badRequest(message: string = 'Bad request', details?: any): ServiceError {
    return new ServiceError(ErrorCode.BAD_REQUEST, message, StatusCodes.BAD_REQUEST, details);
  }

  static unauthorized(message: string = 'Unauthorized', details?: any): ServiceError {
    return new ServiceError(ErrorCode.UNAUTHORIZED, message, StatusCodes.UNAUTHORIZED, details);
  }

  static forbidden(message: string = 'Forbidden', details?: any): ServiceError {
    return new ServiceError(ErrorCode.FORBIDDEN, message, StatusCodes.FORBIDDEN, details);
  }

  static databaseError(message: string = 'Database error', details?: any): ServiceError {
    return new ServiceError(
      ErrorCode.DATABASE_ERROR,
      message,
      StatusCodes.INTERNAL_SERVER_ERROR,
      details
    );
  }

  static internalError(message: string = 'Internal server error', details?: any): ServiceError {
    return new ServiceError(
      ErrorCode.INTERNAL_ERROR,
      message,
      StatusCodes.INTERNAL_SERVER_ERROR,
      details
    );
  }

  static serviceUnavailable(message: string = 'Service unavailable', details?: any): ServiceError {
    return new ServiceError(
      ErrorCode.SERVICE_UNAVAILABLE,
      message,
      StatusCodes.SERVICE_UNAVAILABLE,
      details
    );
  }
}

export class ServiceResponse<T = any> {
  private constructor(
    public success: boolean,
    public data: T | null,
    public error: ServiceError | null,
    public statusCode: number
  ) {}

  // Success responses
  static ok<T>(data: T, statusCode: number = StatusCodes.OK): ServiceResponse<T> {
    return new ServiceResponse(true, data, null, statusCode);
  }

  static created<T>(data: T): ServiceResponse<T> {
    return new ServiceResponse(true, data, null, StatusCodes.CREATED);
  }

  static noContent(): ServiceResponse<null> {
    return new ServiceResponse(true, null, null, StatusCodes.NO_CONTENT);
  }

  // Error responses
  static fail(error: ServiceError): ServiceResponse<null> {
    return new ServiceResponse(false, null, error, error.statusCode);
  }

  static notFound(message?: string, details?: any): ServiceResponse<null> {
    return ServiceResponse.fail(ServiceError.notFound(message, details));
  }

  static alreadyExists(message?: string, details?: any): ServiceResponse<null> {
    return ServiceResponse.fail(ServiceError.alreadyExists(message, details));
  }

  static validationError(message?: string, details?: any): ServiceResponse<null> {
    return ServiceResponse.fail(ServiceError.validationError(message, details));
  }

  static badRequest(message?: string, details?: any): ServiceResponse<null> {
    return ServiceResponse.fail(ServiceError.badRequest(message, details));
  }

  static unauthorized(message?: string, details?: any): ServiceResponse<null> {
    return ServiceResponse.fail(ServiceError.unauthorized(message, details));
  }

  static forbidden(message?: string, details?: any): ServiceResponse<null> {
    return ServiceResponse.fail(ServiceError.forbidden(message, details));
  }

  static databaseError(message?: string, details?: any): ServiceResponse<null> {
    return ServiceResponse.fail(ServiceError.databaseError(message, details));
  }

  static internalError(message?: string, details?: any): ServiceResponse<null> {
    return ServiceResponse.fail(ServiceError.internalError(message, details));
  }

  // Utility methods
  isSuccess(): boolean {
    return this.success;
  }

  isFailure(): boolean {
    return !this.success;
  }

  getData(): T | null {
    return this.data;
  }

  getError(): ServiceError | null {
    return this.error;
  }

  // Transform response to HTTP response format
  toJSON() {
    if (this.success) {
      return {
        success: true,
        data: this.data,
      };
    }

    return {
      success: false,
      error: {
        code: this.error!.code,
        message: this.error!.message,
        ...(this.error!.details && { details: this.error!.details }),
      },
    };
  }
}
