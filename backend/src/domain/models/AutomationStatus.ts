import {
  AutomationStep,
  AutomationStatus as AutomationStatusType,
  StepRecord,
} from '../validators/schemas';

export type { AutomationStatusType as AutomationStatus };
export type { AutomationStep, StepRecord };

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
    const now = new Date();
    const status: AutomationStatusType = {
      requestId,
      currentStep: 'initializing',
      progress: 0,
      startedAt: now,
      updatedAt: now,
      steps: [{ step: 'initializing', startedAt: now }],
    };
    this.statuses.set(requestId, status);
    return status;
  }

  update(update: StatusUpdate): AutomationStatusType {
    const existing = this.statuses.get(update.requestId);
    if (!existing) {
      throw new Error(`Status not found for requestId: ${update.requestId}`);
    }

    const now = new Date();

    const lastStep = existing.steps[existing.steps.length - 1];
    if (lastStep && !lastStep.completedAt) {
      lastStep.completedAt = now;
      lastStep.duration = now.getTime() - lastStep.startedAt.getTime();
    }

    if (update.step !== 'completed' && update.step !== 'failed') {
      existing.steps.push({ step: update.step, startedAt: now });
    }

    existing.currentStep = update.step;
    existing.progress = update.progress;
    existing.updatedAt = now;
    existing.error = update.error;
    existing.screenshotPath = update.screenshotPath ?? existing.screenshotPath;
    existing.completedAt =
      update.step === 'completed' || update.step === 'failed' ? now : undefined;

    return existing;
  }

  setResult(requestId: string, result: Record<string, unknown>): void {
    const existing = this.statuses.get(requestId);
    if (existing) {
      existing.result = result;
    }
  }

  get(requestId: string): AutomationStatusType | undefined {
    return this.statuses.get(requestId);
  }

  delete(requestId: string): boolean {
    return this.statuses.delete(requestId);
  }
}

export const statusTracker = new AutomationStatusTracker();
