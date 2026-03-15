import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDuration, getStepLabel } from '@/utils/formatters';
import { CheckCircle, XCircle, Image, RefreshCw, Clock } from 'lucide-react';
import type { AutomationStatus } from '@/types';

interface ResultState {
  status: AutomationStatus;
}

export function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ResultState | null;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!state?.status?.result) {
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  if (!state?.status?.result) return null;

  const { status } = state;
  const result = status.result!;
  const product = result.product;
  const isSuccess = result.order !== null;

  const totalDuration = status.completedAt && status.startedAt
    ? new Date(status.completedAt).getTime() - new Date(status.startedAt).getTime()
    : null;

  return (
    <div className="space-y-6">
      <div className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${
        isSuccess ? 'border-success bg-success/5' : 'border-destructive bg-destructive/5'
      }`}>
        {isSuccess
          ? <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
          : <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
        }
        <div className="flex-1">
          <span className="text-sm font-semibold">
            {isSuccess ? 'Purchase Completed Successfully' : 'Purchase Failed'}
          </span>
        </div>
        {totalDuration !== null && (
          <Badge variant="secondary" className="text-xs px-2 py-0.5">
            {formatDuration(totalDuration)}
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {product?.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-16 h-16 object-contain rounded-lg bg-muted p-1.5 flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  {product && (
                    <p className="font-medium text-sm leading-tight truncate">{product.title}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      {result.orderTotal ?? (product ? formatPrice(product.price, product.currency) : '')}
                    </span>
                    <Badge variant={isSuccess ? 'default' : 'destructive'} className="text-[10px] px-1.5 py-0">
                      {isSuccess ? 'Confirmed' : 'Failed'}
                    </Badge>
                  </div>
                  {result.order?.id && (
                    <p className="text-[11px] font-mono text-muted-foreground truncate">{result.order.id}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {status.steps.length > 0 && (
            <Card className="lg:flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Automation Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="lg:flex-1 flex flex-col">
                <div className="lg:flex-1 flex flex-col lg:justify-between gap-2 lg:gap-0">
                  {status.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm py-1">
                      <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <span className="flex-1">{getStepLabel(step.step)}</span>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {step.duration !== undefined ? formatDuration(step.duration) : '-'}
                      </span>
                    </div>
                  ))}
                </div>
                {totalDuration !== null && (
                  <div className="pt-3 mt-3 border-t flex justify-between items-center font-medium text-sm">
                    <span>Total</span>
                    <span>{formatDuration(totalDuration)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {result.screenshotPath && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Screenshot Proof
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-muted">
                  {imageError ? (
                    <div className="p-12 text-center text-muted-foreground">
                      <Image className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm mb-1">Screenshot saved at:</p>
                      <code className="text-xs break-all">{result.screenshotPath}</code>
                    </div>
                  ) : (
                    <img
                      src={`/api/screenshots/${result.screenshotPath.split(/[/\\]/).pop()}`}
                      alt="Checkout proof screenshot"
                      className="w-full h-auto"
                      onError={() => setImageError(true)}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {result.error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                  {result.error}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Button onClick={() => navigate('/')} size="lg" className="w-full" variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        Start New Search
      </Button>
    </div>
  );
}
