import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  AutomationError,
  TimeoutError,
  SelectorNotFoundError,
} from './AppError';

describe('AppError', () => {
  it('creates error with all options', () => {
    const cause = new Error('original');
    const error = new AppError({
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
      step: 'test_step',
      isRetryable: true,
      cause,
    });

    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.message).toBe('Something went wrong');
    expect(error.step).toBe('test_step');
    expect(error.isRetryable).toBe(true);
    expect(error.cause).toBe(cause);
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it('defaults isRetryable to false', () => {
    const error = new AppError({
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
    });
    expect(error.isRetryable).toBe(false);
  });

  it('serializes to JSON correctly', () => {
    const error = new AppError({
      code: 'NETWORK_ERROR',
      message: 'Connection failed',
      step: 'api_call',
      isRetryable: true,
    });

    const json = error.toJSON();
    expect(json).toMatchObject({
      name: 'AppError',
      code: 'NETWORK_ERROR',
      message: 'Connection failed',
      step: 'api_call',
      isRetryable: true,
    });
    expect(json.timestamp).toBeDefined();
  });

  it('is instanceof Error', () => {
    const error = new AppError({
      code: 'INTERNAL_ERROR',
      message: 'Test',
    });
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('ValidationError', () => {
  it('creates error with correct defaults', () => {
    const error = new ValidationError('Invalid email format', 'form_validation');

    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Invalid email format');
    expect(error.step).toBe('form_validation');
    expect(error.isRetryable).toBe(false);
    expect(error.name).toBe('ValidationError');
  });

  it('works without step', () => {
    const error = new ValidationError('Missing field');
    expect(error.step).toBeUndefined();
  });
});

describe('AutomationError', () => {
  it('creates error with retryable default true', () => {
    const error = new AutomationError('Click failed', 'button_click');

    expect(error.code).toBe('AUTOMATION_ERROR');
    expect(error.isRetryable).toBe(true);
    expect(error.step).toBe('button_click');
  });

  it('allows setting isRetryable to false', () => {
    const error = new AutomationError('Critical failure', 'init', false);
    expect(error.isRetryable).toBe(false);
  });

  it('accepts cause error', () => {
    const cause = new Error('Browser crash');
    const error = new AutomationError('Automation failed', 'step', true, cause);
    expect(error.cause).toBe(cause);
  });
});

describe('TimeoutError', () => {
  it('creates error with correct code and retryable', () => {
    const error = new TimeoutError('Operation timed out', 'api_call');

    expect(error.code).toBe('TIMEOUT_ERROR');
    expect(error.isRetryable).toBe(true);
    expect(error.step).toBe('api_call');
    expect(error.name).toBe('TimeoutError');
  });
});

describe('SelectorNotFoundError', () => {
  it('creates error with selector in message', () => {
    const error = new SelectorNotFoundError('#submit-button', 'form_submit');

    expect(error.code).toBe('SELECTOR_NOT_FOUND');
    expect(error.message).toBe('Selector not found: #submit-button');
    expect(error.step).toBe('form_submit');
    expect(error.isRetryable).toBe(true);
  });
});

describe('Error Codes', () => {
  it('supports STATUS_NOT_FOUND error code', () => {
    const error = new AppError({
      code: 'STATUS_NOT_FOUND',
      message: 'Status not found for request',
      isRetryable: false,
    });

    expect(error.code).toBe('STATUS_NOT_FOUND');
    expect(error.isRetryable).toBe(false);
  });

  it('supports all defined error codes', () => {
    const errorCodes = [
      'VALIDATION_ERROR',
      'AUTOMATION_ERROR',
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'SELECTOR_NOT_FOUND',
      'LOGIN_FAILED',
      'CART_ERROR',
      'CHECKOUT_ERROR',
      'PRODUCT_NOT_FOUND',
      'STATUS_NOT_FOUND',
      'INTERNAL_ERROR',
    ] as const;

    errorCodes.forEach((code) => {
      const error = new AppError({ code, message: `Test ${code}` });
      expect(error.code).toBe(code);
    });
  });
});
