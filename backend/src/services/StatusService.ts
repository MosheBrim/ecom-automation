import { AutomationStatus, AutomationStep, statusTracker } from '../domain/models/AutomationStatus';
import { createLogger } from '../utils/logger';

export class StatusService {
  createStatus(requestId: string): AutomationStatus {
    const log = createLogger(requestId);
    const status = statusTracker.create(requestId);
    log.info('Automation status created');
    return status;
  }

  updateStatus(
    requestId: string,
    step: AutomationStep,
    progress: number,
    error?: string,
    screenshotPath?: string
  ): AutomationStatus {
    const log = createLogger(requestId);

    const status = statusTracker.update({
      requestId,
      step,
      progress,
      error,
      screenshotPath,
    });

    log.info(`Status updated: ${step} (${progress}%)`, { step, progress });
    return status;
  }

  getStatus(requestId: string): AutomationStatus | null {
    return statusTracker.get(requestId) ?? null;
  }

  completeStatus(
    requestId: string,
    screenshotPath?: string
  ): AutomationStatus {
    return this.updateStatus(requestId, 'completed', 100, undefined, screenshotPath);
  }

  failStatus(
    requestId: string,
    error: string,
    screenshotPath?: string
  ): AutomationStatus {
    return this.updateStatus(requestId, 'failed', 100, error, screenshotPath);
  }

  cleanupStatus(requestId: string): boolean {
    return statusTracker.delete(requestId);
  }
}

export const statusService = new StatusService();
