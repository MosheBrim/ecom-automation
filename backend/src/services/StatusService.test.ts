import { describe, it, expect, beforeEach } from 'vitest';
import { StatusService } from './StatusService';
import { statusTracker } from '../domain/models/AutomationStatus';

describe('StatusService', () => {
  let service: StatusService;
  const testRequestId = 'test-request-123';

  beforeEach(() => {
    service = new StatusService();
    statusTracker.delete(testRequestId);
  });

  describe('createStatus', () => {
    it('creates a new status with initializing step', () => {
      const status = service.createStatus(testRequestId);

      expect(status.requestId).toBe(testRequestId);
      expect(status.currentStep).toBe('initializing');
      expect(status.progress).toBe(0);
      expect(status.startedAt).toBeInstanceOf(Date);
    });

    it('returns the created status', () => {
      const status = service.createStatus(testRequestId);
      const retrieved = service.getStatus(testRequestId);

      expect(retrieved).toEqual(status);
    });
  });

  describe('updateStatus', () => {
    it('updates step and progress', () => {
      service.createStatus(testRequestId);
      const status = service.updateStatus(testRequestId, 'searching', 50);

      expect(status.currentStep).toBe('searching');
      expect(status.progress).toBe(50);
    });

    it('updates with error message', () => {
      service.createStatus(testRequestId);
      const status = service.updateStatus(testRequestId, 'failed', 100, 'Something went wrong');

      expect(status.error).toBe('Something went wrong');
    });

    it('updates with screenshot path', () => {
      service.createStatus(testRequestId);
      const status = service.updateStatus(testRequestId, 'completed', 100, undefined, '/path/to/screenshot.png');

      expect(status.screenshotPath).toBe('/path/to/screenshot.png');
    });

    it('throws when status does not exist', () => {
      expect(() => service.updateStatus('non-existent', 'searching', 50)).toThrow();
    });
  });

  describe('getStatus', () => {
    it('returns null for non-existent status', () => {
      const status = service.getStatus('non-existent');
      expect(status).toBeNull();
    });

    it('returns existing status', () => {
      service.createStatus(testRequestId);
      const status = service.getStatus(testRequestId);

      expect(status).not.toBeNull();
      expect(status?.requestId).toBe(testRequestId);
    });
  });

  describe('completeStatus', () => {
    it('sets step to completed and progress to 100', () => {
      service.createStatus(testRequestId);
      const status = service.completeStatus(testRequestId);

      expect(status.currentStep).toBe('completed');
      expect(status.progress).toBe(100);
      expect(status.completedAt).toBeInstanceOf(Date);
    });

    it('includes screenshot path when provided', () => {
      service.createStatus(testRequestId);
      const status = service.completeStatus(testRequestId, '/screenshots/proof.png');

      expect(status.screenshotPath).toBe('/screenshots/proof.png');
    });
  });

  describe('failStatus', () => {
    it('sets step to failed with error message', () => {
      service.createStatus(testRequestId);
      const status = service.failStatus(testRequestId, 'Network timeout');

      expect(status.currentStep).toBe('failed');
      expect(status.progress).toBe(100);
      expect(status.error).toBe('Network timeout');
      expect(status.completedAt).toBeInstanceOf(Date);
    });

    it('includes screenshot path when provided', () => {
      service.createStatus(testRequestId);
      const status = service.failStatus(testRequestId, 'Error', '/screenshots/error.png');

      expect(status.screenshotPath).toBe('/screenshots/error.png');
    });
  });

  describe('cleanupStatus', () => {
    it('removes existing status', () => {
      service.createStatus(testRequestId);
      const deleted = service.cleanupStatus(testRequestId);

      expect(deleted).toBe(true);
      expect(service.getStatus(testRequestId)).toBeNull();
    });

    it('returns false for non-existent status', () => {
      const deleted = service.cleanupStatus('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('status flow', () => {
    it('tracks full automation flow', () => {
      service.createStatus(testRequestId);

      service.updateStatus(testRequestId, 'opening_browser', 10);
      let status = service.getStatus(testRequestId);
      expect(status?.currentStep).toBe('opening_browser');
      expect(status?.progress).toBe(10);

      service.updateStatus(testRequestId, 'searching', 30);
      status = service.getStatus(testRequestId);
      expect(status?.currentStep).toBe('searching');

      service.updateStatus(testRequestId, 'scraping_results', 60);
      service.updateStatus(testRequestId, 'selecting_product', 80);

      service.completeStatus(testRequestId, '/proof.png');
      status = service.getStatus(testRequestId);

      expect(status?.currentStep).toBe('completed');
      expect(status?.progress).toBe(100);
      expect(status?.screenshotPath).toBe('/proof.png');
      expect(status?.completedAt).toBeDefined();
    });
  });
});
