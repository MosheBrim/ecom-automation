import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AutomationStatus } from '@/types';
import { getStepLabel } from '@/utils/formatters';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface StatusTrackerProps {
  status: AutomationStatus | null;
  isLoading: boolean;
}

export function StatusTracker({ status, isLoading }: StatusTrackerProps) {
  if (isLoading && !status) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading status...</p>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return null;
  }

  const isCompleted = status.currentStep === 'completed';
  const isFailed = status.currentStep === 'failed';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Automation Status</span>
          <Badge variant={isCompleted ? 'default' : isFailed ? 'destructive' : 'secondary'}>
            {getStepLabel(status.currentStep)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{status.progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isFailed ? 'bg-destructive' : 'bg-primary'
              }`}
              style={{ width: `${status.progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted && (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-500 font-medium">Completed successfully</span>
            </>
          )}
          {isFailed && (
            <>
              <XCircle className="h-5 w-5 text-destructive" />
              <span className="text-destructive font-medium">
                {status.error ?? 'An error occurred'}
              </span>
            </>
          )}
          {!isCompleted && !isFailed && (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{getStepLabel(status.currentStep)}...</span>
            </>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Request ID: {status.requestId}
        </div>
      </CardContent>
    </Card>
  );
}
