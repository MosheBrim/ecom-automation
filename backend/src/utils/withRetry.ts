import { createLogger } from './logger';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'shouldRetry' | 'onRetry'>> = {
  maxAttempts: 3,
  initialDelayMs: 500,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  requestId: string,
  operationName: string,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const log = createLogger(requestId).withStep(operationName);

  let lastError: Error | null = null;
  let currentDelay = opts.initialDelayMs;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      const startTime = Date.now();
      const result = await fn();
      log.success(`Completed on attempt ${attempt}`, Date.now() - startTime);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      const shouldRetry = opts.shouldRetry?.(lastError) ?? true;
      const hasMoreAttempts = attempt < opts.maxAttempts;

      if (!shouldRetry || !hasMoreAttempts) {
        log.error(`Failed after ${attempt} attempts: ${lastError.message}`);
        throw lastError;
      }

      log.info(`Attempt ${attempt} failed, retrying in ${currentDelay}ms`, {
        error: lastError.message,
      });

      opts.onRetry?.(attempt, lastError);
      await sleep(currentDelay);

      currentDelay = Math.min(currentDelay * opts.backoffMultiplier, opts.maxDelayMs);
    }
  }

  throw lastError ?? new Error('Retry failed with unknown error');
}
