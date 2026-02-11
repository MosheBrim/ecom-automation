import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Product, Address, CheckoutRequest } from '@/types';
import { CreditCard, Package } from 'lucide-react';

interface CheckoutFormProps {
  product: Product;
  onCheckout: (request: CheckoutRequest) => void;
  isLoading: boolean;
  onCancel: () => void;
}

const INITIAL_ADDRESS: Address = {
  fullName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US',
  phone: '',
};

export function CheckoutForm({ product, onCheckout, isLoading, onCancel }: CheckoutFormProps) {
  const [address, setAddress] = useState<Address>(INITIAL_ADDRESS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onCheckout({
      productId: product.id,
      quantity: 1,
      shippingAddress: address,
      product,
      dryRun: true,
    });
  };

  const updateAddress = (field: keyof Address, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    address.fullName.trim() !== '' &&
    address.addressLine1.trim() !== '' &&
    address.city.trim() !== '' &&
    address.state.trim() !== '' &&
    address.zipCode.trim() !== '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Checkout
        </CardTitle>
        <CardDescription>
          Complete your purchase for {product.title.slice(0, 50)}...
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-muted rounded-lg flex items-center gap-3">
          <Package className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-medium">${product.price.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Qty: 1</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={address.fullName}
              onChange={(e) => updateAddress('fullName', e.target.value)}
              placeholder="John Doe"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1 *</Label>
            <Input
              id="addressLine1"
              value={address.addressLine1}
              onChange={(e) => updateAddress('addressLine1', e.target.value)}
              placeholder="123 Main St"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              value={address.addressLine2}
              onChange={(e) => updateAddress('addressLine2', e.target.value)}
              placeholder="Apt 4B (optional)"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={address.city}
                onChange={(e) => updateAddress('city', e.target.value)}
                placeholder="New York"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={address.state}
                onChange={(e) => updateAddress('state', e.target.value)}
                placeholder="NY"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                value={address.zipCode}
                onChange={(e) => updateAddress('zipCode', e.target.value)}
                placeholder="10001"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={address.phone}
                onChange={(e) => updateAddress('phone', e.target.value)}
                placeholder="(555) 123-4567"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="flex-1"
            >
              {isLoading ? 'Processing...' : 'Complete Purchase'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
