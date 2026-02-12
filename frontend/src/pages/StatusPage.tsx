import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStatus } from '@/hooks/useStatus';
import { getStepLabel, formatDuration } from '@/utils/formatters';
import {
  CheckCircle, XCircle, Loader2, ArrowLeft,
  Globe, LogIn, ShoppingCart, CreditCard, MapPin,
  Wallet, ClipboardCheck, Camera, Settings,
} from 'lucide-react';
import type { AutomationStep, StepRecord } from '@/types';

const AUTO_REDIRECT_DELAY_MS = 1500;

const CHECKOUT_STEPS: AutomationStep[] = [
  'initializing',
  'opening_browser',
  'logging_in',
  'adding_to_cart',
  'checkout',
  'filling_shipping',
  'filling_payment',
  'confirming_order',
  'taking_screenshot',
];

const STEP_ICONS: Record<string, React.ReactNode> = {
  initializing: <Settings className="h-4 w-4" />,
  opening_browser: <Globe className="h-4 w-4" />,
  logging_in: <LogIn className="h-4 w-4" />,
  adding_to_cart: <ShoppingCart className="h-4 w-4" />,
  checkout: <CreditCard className="h-4 w-4" />,
  filling_shipping: <MapPin className="h-4 w-4" />,
  filling_payment: <Wallet className="h-4 w-4" />,
  confirming_order: <ClipboardCheck className="h-4 w-4" />,
  taking_screenshot: <Camera className="h-4 w-4" />,
};

function getStepStatus(
  step: AutomationStep,
  completedSteps: StepRecord[],
  currentStep: AutomationStep
): 'completed' | 'active' | 'pending' {
  if (completedSteps.some((s) => s.step === step && s.completedAt)) return 'completed';
  if (step === currentStep) return 'active';

  const currentIndex = CHECKOUT_STEPS.indexOf(currentStep);
  const stepIndex = CHECKOUT_STEPS.indexOf(step);
  if (stepIndex < currentIndex) return 'completed';
  return 'pending';
}

function getStepDuration(step: AutomationStep, steps: StepRecord[]): number | undefined {
  return steps.find((s) => s.step === step)?.duration;
}

export function StatusPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { status, isCompleted, isFailed, isFinished } = useStatus(requestId ?? null);

  useEffect(() => {
    if (!requestId) {
      navigate('/', { replace: true });
    }
  }, [requestId, navigate]);

  useEffect(() => {
    if (isCompleted && status?.result) {
      const timer = setTimeout(() => {
        navigate('/result', { state: { status } });
      }, AUTO_REDIRECT_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, status, navigate]);

  if (!requestId) return null;

  const currentStep = status?.currentStep ?? 'initializing';
  const progress = status?.progress ?? 0;
  const completedSteps = status?.steps ?? [];

  const totalDuration = status?.completedAt && status?.startedAt
    ? new Date(status.completedAt).getTime() - new Date(status.startedAt).getTime()
    : null;

  const completedCount = CHECKOUT_STEPS.filter(
    (s) => getStepStatus(s, completedSteps, currentStep) === 'completed'
  ).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className={`rounded-xl border-2 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
        isCompleted ? 'border-success bg-success/5'
          : isFailed ? 'border-destructive bg-destructive/5'
            : 'border-primary bg-primary/5'
      }`}>
        <div className={`rounded-full p-3 ${
          isCompleted ? 'bg-success/10'
            : isFailed ? 'bg-destructive/10'
              : 'bg-primary/10'
        }`}>
          {isCompleted && <CheckCircle className="h-8 w-8 text-success" />}
          {isFailed && <XCircle className="h-8 w-8 text-destructive" />}
          {!isFinished && <Loader2 className="h-8 w-8 text-primary animate-spin" />}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">
            {isCompleted ? 'Checkout Complete' : isFailed ? 'Checkout Failed' : 'Automation Running'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isCompleted
              ? 'All steps finished successfully'
              : isFailed
                ? 'An error occurred during automation'
                : `Step ${completedCount + 1} of ${CHECKOUT_STEPS.length} — ${getStepLabel(currentStep)}`}
          </p>
        </div>
        <Badge variant={isCompleted ? 'default' : isFailed ? 'destructive' : 'secondary'} className="text-sm px-3 py-1">
          {isCompleted ? 'Done' : isFailed ? 'Error' : `${progress}%`}
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out rounded-full ${
                isFailed ? 'bg-destructive' : isCompleted ? 'bg-success' : 'bg-primary'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{completedCount} of {CHECKOUT_STEPS.length} steps</span>
            {totalDuration !== null && <span>{formatDuration(totalDuration)}</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Step Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {CHECKOUT_STEPS.map((step, index) => {
              const stepStatus = getStepStatus(step, completedSteps, currentStep);
              const duration = getStepDuration(step, completedSteps);
              const isLast = index === CHECKOUT_STEPS.length - 1;

              return (
                <div key={step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                        ${stepStatus === 'completed' ? 'bg-success text-white' : ''}
                        ${stepStatus === 'active' ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : ''}
                        ${stepStatus === 'pending' ? 'bg-muted text-muted-foreground' : ''}
                      `}
                    >
                      {stepStatus === 'completed' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : stepStatus === 'active' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        STEP_ICONS[step] ?? <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                    {!isLast && (
                      <div className={`w-0.5 flex-1 min-h-[24px] transition-colors ${
                        stepStatus === 'completed' ? 'bg-success' : 'bg-muted'
                      }`} />
                    )}
                  </div>

                  <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
                    <div className="flex items-center justify-between min-h-[36px]">
                      <div>
                        <p className={`text-sm font-medium ${
                          stepStatus === 'pending' ? 'text-muted-foreground' : ''
                        }`}>
                          {getStepLabel(step)}
                        </p>
                        {stepStatus === 'active' && (
                          <p className="text-xs text-primary mt-0.5">Running...</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-xs text-muted-foreground tabular-nums">
                        {duration !== undefined && (
                          <Badge variant="outline" className="text-xs font-mono">
                            {formatDuration(duration)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {isFailed && status?.error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
              <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm text-destructive">{status.error}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {isFinished && (
        <div className="flex gap-3">
          {isCompleted && status?.result ? (
            <div className="flex-1 text-center text-sm text-muted-foreground flex items-center justify-center gap-2 py-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting to results...
            </div>
          ) : (
            <Button
              variant="outline"
              className="flex-1"
              size="lg"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              New Search
            </Button>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center font-mono">
        {requestId}
      </div>
    </div>
  );
}
