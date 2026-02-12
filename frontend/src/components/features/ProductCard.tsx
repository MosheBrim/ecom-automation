import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types';
import { formatPrice } from '@/utils/formatters';
import { Star, ShoppingCart, ImageOff } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onBuy: (product: Product) => void;
  isBuying: boolean;
}

export function ProductCard({ product, onBuy, isBuying }: ProductCardProps) {
  return (
    <Card className="group transition-all hover:shadow-lg hover:border-primary/20 overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-square overflow-hidden bg-muted relative">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="h-full w-full object-contain p-4 transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground gap-2">
              <ImageOff className="h-8 w-8 opacity-40" />
              <span className="text-xs">No Image</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge
              variant={product.inStock ? 'default' : 'destructive'}
              className="text-[10px] px-1.5 py-0.5"
            >
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </Badge>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <h3 className="font-medium text-sm line-clamp-2 leading-snug min-h-[2.5rem]" title={product.title}>
            {product.title}
          </h3>

          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.rating !== undefined && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-muted-foreground text-xs font-medium">
                  {product.rating.toFixed(1)}
                  {product.reviewCount !== undefined && (
                    <span className="opacity-60"> ({product.reviewCount})</span>
                  )}
                </span>
              </div>
            )}
          </div>

          <Button
            className="w-full"
            size="sm"
            onClick={() => onBuy(product)}
            disabled={!product.inStock || isBuying}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            {isBuying ? 'Processing...' : 'Buy Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
