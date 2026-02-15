import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStatus } from '@/hooks/useStatus';
import { getStepLabel, formatDuration } from '@/utils/formatters';
import {
  CheckCircle, XCircle, Loader2, ArrowLeft,
  Globe, LogIn, ShoppingCart, CreditCard, MapPin,
  Wallet, ClipboardCheck, Camera, Settings, Timer, Layers,
} from 'lucide-react';
import type { AutomationStep, StepRecord } from '@/types';

const AUTO_REDIRECT_DELAY_MS = 1500;
const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

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

const STEP_ICONS_SMALL: Record<string, React.ReactNode> = {
  initializing: <Settings className="h-3 w-3" />,
  opening_browser: <Globe className="h-3 w-3" />,
  logging_in: <LogIn className="h-3 w-3" />,
  adding_to_cart: <ShoppingCart className="h-3 w-3" />,
  checkout: <CreditCard className="h-3 w-3" />,
  filling_shipping: <MapPin className="h-3 w-3" />,
  filling_payment: <Wallet className="h-3 w-3" />,
  confirming_order: <ClipboardCheck className="h-3 w-3" />,
  taking_screenshot: <Camera className="h-3 w-3" />,
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

function useElapsedTime(startedAt: string | undefined, isRunning: boolean): number {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!startedAt || !isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const start = new Date(startedAt).getTime();
    const tick = (): void => setElapsed(Date.now() - start);

    tick();
    intervalRef.current = setInterval(tick, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startedAt, isRunning]);

  return elapsed;
}

export function StatusPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { status, isCompleted, isFailed, isFinished } = useStatus(requestId ?? null);

  const elapsed = useElapsedTime(
    status?.startedAt?.toString(),
    !isFinished && !!status?.startedAt
  );

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

  const strokeOffset = RING_CIRCUMFERENCE * (1 - progress / 100);

  const ringColor = isCompleted
    ? 'hsl(var(--success))'
    : isFailed
      ? 'hsl(var(--destructive))'
      : 'hsl(var(--primary))';

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-[280px,1fr]">
            <div className={`flex flex-col items-center justify-center p-8 ${
              isCompleted ? 'bg-success/5' : isFailed ? 'bg-destructive/5' : 'bg-primary/5'
            }`}>
              <div className="relative">
                <svg width="140" height="140" viewBox="0 0 120 120" className="-rotate-90">
                  <circle
                    cx="60" cy="60" r={RING_RADIUS}
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60" cy="60" r={RING_RADIUS}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={strokeOffset}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {isCompleted ? (
                    <CheckCircle className="h-10 w-10 text-success" />
                  ) : isFailed ? (
                    <XCircle className="h-10 w-10 text-destructive" />
                  ) : (
                    <>
                      <span className="text-3xl font-bold tabular-nums">{progress}</span>
                      <span className="text-xs text-muted-foreground -mt-0.5">percent</span>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="font-semibold text-sm">
                  {isCompleted ? 'Complete' : isFailed ? 'Failed' : getStepLabel(currentStep)}
                </p>
                {!isFinished && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Step {completedCount + 1} of {CHECKOUT_STEPS.length}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 mt-5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Timer className="h-3.5 w-3.5" />
                  <span className="tabular-nums font-medium">
                    {totalDuration !== null ? formatDuration(totalDuration) : formatDuration(elapsed)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  <span className="font-medium">{completedCount}/{CHECKOUT_STEPS.length}</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Step Details</h2>
                <Badge variant={isCompleted ? 'default' : isFailed ? 'destructive' : 'secondary'}>
                  {isCompleted ? 'Done' : isFailed ? 'Error' : 'Running'}
                </Badge>
              </div>

              <div className="space-y-1">
                {CHECKOUT_STEPS.map((step) => {
                  const stepStatus = getStepStatus(step, completedSteps, currentStep);
                  const duration = getStepDuration(step, completedSteps);

                  return (
                    <div
                      key={step}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        stepStatus === 'active' ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div
                        className={`
                          w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                          ${stepStatus === 'completed' ? 'bg-success text-white' : ''}
                          ${stepStatus === 'active' ? 'bg-primary text-primary-foreground ring-2 ring-primary/20' : ''}
                          ${stepStatus === 'pending' ? 'bg-muted text-muted-foreground' : ''}
                        `}
                      >
                        {stepStatus === 'completed' ? (
                          <CheckCircle className="h-3.5 w-3.5" />
                        ) : stepStatus === 'active' ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          STEP_ICONS_SMALL[step]
                        )}
                      </div>

                      <span className={`flex-1 text-sm ${
                        stepStatus === 'pending' ? 'text-muted-foreground' : 'font-medium'
                      }`}>
                        {getStepLabel(step)}
                      </span>

                      {duration !== undefined && (
                        <span className="text-xs text-muted-foreground tabular-nums font-mono">
                          {formatDuration(duration)}
                        </span>
                      )}
                      {stepStatus === 'active' && (
                        <span className="text-xs text-primary font-medium">Running</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
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
            <Button variant="outline" className="flex-1" size="lg" onClick={() => navigate('/')}>
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
