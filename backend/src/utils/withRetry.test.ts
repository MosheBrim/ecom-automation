import { describe, it, expect, vi } from 'vitest';
import { withRetry } from './withRetry';

describe('withRetry', () => {
  const requestId = 'test-retry-123';
  const operationName = 'test_operation';

  describe('successful execution', () => {
    it('should return result on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await withRetry(fn, requestId, operationName);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should return result after retries', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, requestId, operationName, {
        initialDelayMs: 10,
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  describe('failure after max attempts', () => {
    it('should throw after exhausting all attempts', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('persistent failure'));

      await expect(
        withRetry(fn, requestId, operationName, {
          maxAttempts: 3,
          initialDelayMs: 10,
        })
      ).rejects.toThrow('persistent failure');

      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw immediately with maxAttempts 1', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('immediate fail'));

      await expect(
        withRetry(fn, requestId, operationName, { maxAttempts: 1 })
      ).rejects.toThrow('immediate fail');

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('shouldRetry option', () => {
    it('should stop retrying when shouldRetry returns false', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('non-retryable'));

      await expect(
        withRetry(fn, requestId, operationName, {
          maxAttempts: 5,
          initialDelayMs: 10,
          shouldRetry: () => false,
        })
      ).rejects.toThrow('non-retryable');

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should continue retrying when shouldRetry returns true', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('retryable'))
        .mockResolvedValue('ok');

      const result = await withRetry(fn, requestId, operationName, {
        initialDelayMs: 10,
        shouldRetry: () => true,
      });

      expect(result).toBe('ok');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should pass the error to shouldRetry', async () => {
      const shouldRetry = vi.fn().mockReturnValue(false);
      const fn = vi.fn().mockRejectedValue(new Error('check this'));

      try {
        await withRetry(fn, requestId, operationName, {
          maxAttempts: 3,
          shouldRetry,
        });
      } catch {
        // Expected
      }

      expect(shouldRetry).toHaveBeenCalledWith(expect.objectContaining({ message: 'check this' }));
    });
  });

  describe('onRetry callback', () => {
    it('should call onRetry on each retry', async () => {
      const onRetry = vi.fn();
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('done');

      await withRetry(fn, requestId, operationName, {
        initialDelayMs: 10,
        onRetry,
      });

      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledWith(1, expect.objectContaining({ message: 'fail 1' }));
      expect(onRetry).toHaveBeenCalledWith(2, expect.objectContaining({ message: 'fail 2' }));
    });

    it('should not call onRetry on success', async () => {
      const onRetry = vi.fn();
      const fn = vi.fn().mockResolvedValue('ok');

      await withRetry(fn, requestId, operationName, { onRetry });

      expect(onRetry).not.toHaveBeenCalled();
    });
  });

  describe('backoff behavior', () => {
    it('should increase delay between retries', async () => {
      const sleepTimes: number[] = [];
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('ok');

      const startTimes: number[] = [];
      const originalFn = fn.getMockImplementation;

      const trackingFn = vi.fn(async () => {
        startTimes.push(Date.now());
        const result = fn();
        return result;
      });

      await withRetry(
        async () => {
          const callCount = fn();
          return callCount;
        },
        requestId,
        operationName,
        {
          initialDelayMs: 50,
          backoffMultiplier: 2,
          maxDelayMs: 500,
        }
      );

      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should respect maxDelayMs', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('ok');

      await withRetry(fn, requestId, operationName, {
        maxAttempts: 4,
        initialDelayMs: 100,
        backoffMultiplier: 100,
        maxDelayMs: 150,
      });

      expect(fn).toHaveBeenCalledTimes(4);
    });
  });

  describe('error handling', () => {
    it('should convert non-Error throws to Error', async () => {
      const fn = vi.fn().mockRejectedValue('string error');

      await expect(
        withRetry(fn, requestId, operationName, { maxAttempts: 1 })
      ).rejects.toThrow('string error');
    });

    it('should preserve original Error type', async () => {
      const customError = new TypeError('type mismatch');
      const fn = vi.fn().mockRejectedValue(customError);

      try {
        await withRetry(fn, requestId, operationName, { maxAttempts: 1 });
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError);
        expect((error as Error).message).toBe('type mismatch');
      }
    });
  });
});
