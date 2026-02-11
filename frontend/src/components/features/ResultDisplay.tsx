import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CheckoutResponse, Product } from '@/types';
import { CheckCircle, XCircle, Image, RefreshCw } from 'lucide-react';

interface ResultDisplayProps {
  result: CheckoutResponse;
  product: Product;
  onReset: () => void;
  error?: string | null;
}

export function ResultDisplay({ result, product, onReset, error }: ResultDisplayProps) {
  const [imageError, setImageError] = useState(false);
  const isSuccess = result.order !== null || result.screenshotPath !== undefined;

  return (
    <Card className={isSuccess ? 'border-green-500' : 'border-red-500'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSuccess ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              Checkout Completed
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-500" />
              Checkout Failed
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isSuccess
            ? 'Your automation completed successfully'
            : 'There was an issue with the checkout process'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Product</span>
            <span className="font-medium text-sm">{product.title.slice(0, 40)}...</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Price</span>
            <span className="font-medium">${product.price.toFixed(2)}</span>
          </div>
          {result.orderTotal && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Order Total</span>
              <span className="font-medium">{result.orderTotal}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={isSuccess ? 'default' : 'destructive'}>
              {isSuccess ? 'Success' : 'Failed'}
            </Badge>
          </div>
        </div>

        {result.screenshotPath && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Image className="h-4 w-4" />
              Screenshot Proof
            </div>
            <div className="border rounded-lg overflow-hidden bg-muted">
              {imageError ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>Screenshot saved at:</p>
                  <code className="text-xs">{result.screenshotPath}</code>
                </div>
              ) : (
                <img
                  src={`/api/screenshots/${result.screenshotPath.split('/').pop()}`}
                  alt="Checkout proof"
                  className="w-full h-auto"
                  onError={() => setImageError(true)}
                />
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        <Button onClick={onReset} className="w-full" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Start New Search
        </Button>
      </CardContent>
    </Card>
  );
}
