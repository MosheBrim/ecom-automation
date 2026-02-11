import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types';
import { formatPrice } from '@/utils/formatters';
import { Star, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, isSelected, onSelect }: ProductCardProps) {
  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="aspect-square mb-4 overflow-hidden rounded-md bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-sm line-clamp-2" title={product.title}>
            {product.title}
          </h3>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.isPrime && (
              <Badge variant="secondary">Prime</Badge>
            )}
          </div>

          {product.rating !== undefined && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{product.rating.toFixed(1)}</span>
              {product.reviewCount !== undefined && (
                <span>({product.reviewCount})</span>
              )}
            </div>
          )}

          <Badge variant={product.inStock ? 'default' : 'destructive'}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          variant={isSelected ? 'secondary' : 'default'}
          onClick={() => onSelect(product)}
          disabled={!product.inStock}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isSelected ? 'Selected' : 'Select'}
        </Button>
      </CardFooter>
    </Card>
  );
}
