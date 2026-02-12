import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDuration, getStepLabel } from '@/utils/formatters';
import { CheckCircle, XCircle, Image, RefreshCw, Clock, Package, ShoppingBag } from 'lucide-react';
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
  const result = status.result;
  const product = result.product;
  const isSuccess = result.order !== null;

  const totalDuration = status.completedAt && status.startedAt
    ? new Date(status.completedAt).getTime() - new Date(status.startedAt).getTime()
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className={`rounded-xl border-2 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
        isSuccess ? 'border-green-500 bg-green-500/5' : 'border-destructive bg-destructive/5'
      }`}>
        <div className={`rounded-full p-3 ${isSuccess ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
          {isSuccess
            ? <CheckCircle className="h-8 w-8 text-green-500" />
            : <XCircle className="h-8 w-8 text-destructive" />
          }
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">
            {isSuccess ? 'Purchase Completed Successfully' : 'Purchase Failed'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isSuccess
              ? 'The automated checkout completed successfully'
              : 'There was an issue during the automated checkout'}
          </p>
        </div>
        {totalDuration !== null && (
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {formatDuration(totalDuration)}
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          {product && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Product
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center gap-3">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-24 h-24 object-contain rounded-lg bg-muted p-2"
                    />
                  )}
                  <div className="space-y-1">
                    <p className="font-medium leading-tight">{product.title}</p>
                    <p className="text-2xl font-bold text-primary">{formatPrice(product.price, product.currency)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.orderTotal && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total</span>
                  <span className="font-bold text-lg">{result.orderTotal}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm">Status</span>
                <Badge variant={isSuccess ? 'default' : 'destructive'}>
                  {isSuccess ? 'Confirmed' : 'Failed'}
                </Badge>
              </div>
              {result.order?.id && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Order ID</span>
                  <span className="text-xs font-mono text-muted-foreground">{result.order.id}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {status.steps.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Automation Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {status.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
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
