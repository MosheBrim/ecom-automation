import { describe, it, expect } from 'vitest';
import { withTimeout } from './withTimeout';
import { TimeoutError } from '../domain/errors/AppError';

describe('withTimeout', () => {
  it('resolves when operation completes before timeout', async () => {
    const result = await withTimeout(
      async () => 'success',
      1000,
      'test_step'
    );
    expect(result).toBe('success');
  });

  it('throws TimeoutError when operation exceeds timeout', async () => {
    const slowOperation = () =>
      new Promise<string>((resolve) => setTimeout(() => resolve('done'), 500));

    await expect(
      withTimeout(slowOperation, 50, 'slow_step')
    ).rejects.toThrow(/timed out/i);
  });

  it('preserves return type', async () => {
    const result = await withTimeout(
      async () => ({ value: 42 }),
      1000,
      'test'
    );
    expect(result).toEqual({ value: 42 });
  });

  it('propagates errors from the operation', async () => {
    const failingOp = async () => {
      throw new Error('Operation failed');
    };

    await expect(withTimeout(failingOp, 1000, 'failing')).rejects.toThrow(
      'Operation failed'
    );
  });

  it('cleans up timeout when operation succeeds', async () => {
    const result = await withTimeout(async () => 'quick', 5000, 'cleanup_test');
    expect(result).toBe('quick');
  });

  it('includes step name in timeout error', async () => {
    const slowOp = () => new Promise<void>((resolve) => setTimeout(resolve, 500));

    try {
      await withTimeout(slowOp, 10, 'my_step');
      expect.fail('Should have thrown');
    } catch (error) {
      expect((error as { step: string }).step).toBe('my_step');
      expect((error as { code: string }).code).toBe('TIMEOUT_ERROR');
    }
  });
});
