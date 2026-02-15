import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/errors/AppError';
import { ZodError } from 'zod';
import { createLogger } from '../../utils/logger';

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    step?: string;
  };
  meta: {
    requestId: string;
    timestamp: string;
  };
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId ?? 'unknown';
  const log = createLogger(requestId);

  log.error(`Error: ${err.message}`, { stack: err.stack });

  if (err instanceof AppError) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        step: err.step,
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    };

    res.status(getStatusCode(err.code)).json(response);
    return;
  }

  if (err instanceof ZodError) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    };

    res.status(400).json(response);
    return;
  }

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
    },
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
    },
  };

  res.status(500).json(response);
}

function getStatusCode(code: string): number {
  switch (code) {
    case 'VALIDATION_ERROR':
      return 400;
    case 'PRODUCT_NOT_FOUND':
      return 404;
    case 'LOGIN_FAILED':
      return 401;
    case 'TIMEOUT_ERROR':
    case 'AUTOMATION_ERROR':
    case 'NETWORK_ERROR':
      return 503;
    default:
      return 500;
  }
}
