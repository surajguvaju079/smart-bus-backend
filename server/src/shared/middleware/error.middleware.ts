import { Request, Response, NextFunction } from 'express';
import { ServiceError } from '@shared/types/index';
import { StatusCodes } from 'http-status-codes';
import { env } from '@config/env';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Handle ServiceError
  if (err instanceof ServiceError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  // Log unexpected errors
  console.error('💥 Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Generic error response
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
      ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
};
