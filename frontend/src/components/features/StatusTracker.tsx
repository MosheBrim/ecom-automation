import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AutomationStatus } from '@/types';
import { getStepLabel } from '@/utils/formatters';
import { CheckCircle, XCircle, Loader2, Activity } from 'lucide-react';

interface StatusTrackerProps {
  status: AutomationStatus;
}

export function StatusTracker({ status }: StatusTrackerProps) {
  const isCompleted = status.currentStep === 'completed';
  const isFailed = status.currentStep === 'failed';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            Status
          </span>
          <Badge variant={isCompleted ? 'default' : isFailed ? 'destructive' : 'secondary'}>
            {getStepLabel(status.currentStep)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="font-medium">{status.progress}%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out rounded-full ${
                isFailed ? 'bg-destructive' : isCompleted ? 'bg-green-500' : 'bg-primary'
              }`}
              style={{ width: `${status.progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm pt-1">
          {isCompleted && (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">Completed</span>
            </>
          )}
          {isFailed && (
            <>
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-destructive text-xs">{status.error ?? 'Error'}</span>
            </>
          )}
          {!isCompleted && !isFailed && (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-muted-foreground">{getStepLabel(status.currentStep)}...</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
