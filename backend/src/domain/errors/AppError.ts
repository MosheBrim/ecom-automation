export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTOMATION_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'SELECTOR_NOT_FOUND'
  | 'LOGIN_FAILED'
  | 'CART_ERROR'
  | 'CHECKOUT_ERROR'
  | 'PRODUCT_NOT_FOUND'
  | 'STATUS_NOT_FOUND'
  | 'INTERNAL_ERROR';

export interface AppErrorOptions {
  code: ErrorCode;
  message: string;
  step?: string;
  isRetryable?: boolean;
  cause?: Error;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly step: string | undefined;
  public readonly isRetryable: boolean;
  public readonly cause: Error | undefined;
  public readonly timestamp: Date;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code;
    this.step = options.step;
    this.isRetryable = options.isRetryable ?? false;
    this.cause = options.cause;
    this.timestamp = new Date();

    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      step: this.step,
      isRetryable: this.isRetryable,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, step?: string) {
    super({
      code: 'VALIDATION_ERROR',
      message,
      step,
      isRetryable: false,
    });
    this.name = 'ValidationError';
  }
}

export class AutomationError extends AppError {
  constructor(message: string, step: string, isRetryable = true, cause?: Error) {
    super({
      code: 'AUTOMATION_ERROR',
      message,
      step,
      isRetryable,
      cause,
    });
    this.name = 'AutomationError';
  }
}

export class TimeoutError extends AppError {
  constructor(message: string, step: string) {
    super({
      code: 'TIMEOUT_ERROR',
      message,
      step,
      isRetryable: true,
    });
    this.name = 'TimeoutError';
  }
}

export class SelectorNotFoundError extends AppError {
  constructor(selector: string, step: string) {
    super({
      code: 'SELECTOR_NOT_FOUND',
      message: `Selector not found: ${selector}`,
      step,
      isRetryable: true,
    });
    this.name = 'SelectorNotFoundError';
  }
}
