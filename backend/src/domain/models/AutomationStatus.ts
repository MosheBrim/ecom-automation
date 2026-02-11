import { AutomationStep, AutomationStatus as AutomationStatusType } from '../validators/schemas';

export type { AutomationStatusType as AutomationStatus };
export type { AutomationStep };

export interface StatusUpdate {
  requestId: string;
  step: AutomationStep;
  progress: number;
  error?: string;
  screenshotPath?: string;
}

export class AutomationStatusTracker {
  private statuses: Map<string, AutomationStatusType> = new Map();

  create(requestId: string): AutomationStatusType {
    const status: AutomationStatusType = {
      requestId,
      currentStep: 'initializing',
      progress: 0,
      startedAt: new Date(),
      updatedAt: new Date(),
    };
    this.statuses.set(requestId, status);
    return status;
  }

  update(update: StatusUpdate): AutomationStatusType {
    const existing = this.statuses.get(update.requestId);
    if (!existing) {
      throw new Error(`Status not found for requestId: ${update.requestId}`);
    }

    const updated: AutomationStatusType = {
      ...existing,
      currentStep: update.step,
      progress: update.progress,
      updatedAt: new Date(),
      error: update.error,
      screenshotPath: update.screenshotPath,
      completedAt: update.step === 'completed' || update.step === 'failed'
        ? new Date()
        : undefined,
    };

    this.statuses.set(update.requestId, updated);
    return updated;
  }

  get(requestId: string): AutomationStatusType | undefined {
    return this.statuses.get(requestId);
  }

  delete(requestId: string): boolean {
    return this.statuses.delete(requestId);
  }
}

export const statusTracker = new AutomationStatusTracker();
