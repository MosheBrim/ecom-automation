import { Address, Product } from '../validators/schemas';

export interface Order {
  id: string;
  requestId: string;
  product: Product;
  quantity: number;
  shippingAddress: Address;
  status: OrderStatus;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  screenshotPath?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export class OrderBuilder {
  private order: Partial<Order> = {};

  setId(id: string): OrderBuilder {
    this.order.id = id;
    return this;
  }

  setRequestId(requestId: string): OrderBuilder {
    this.order.requestId = requestId;
    return this;
  }

  setProduct(product: Product): OrderBuilder {
    this.order.product = product;
    return this;
  }

  setQuantity(quantity: number): OrderBuilder {
    this.order.quantity = quantity;
    return this;
  }

  setShippingAddress(address: Address): OrderBuilder {
    this.order.shippingAddress = address;
    return this;
  }

  setStatus(status: OrderStatus): OrderBuilder {
    this.order.status = status;
    return this;
  }

  setScreenshotPath(path: string): OrderBuilder {
    this.order.screenshotPath = path;
    return this;
  }

  build(): Order {
    const now = new Date();

    if (!this.order.id || !this.order.requestId || !this.order.product ||
        !this.order.shippingAddress || this.order.quantity === undefined) {
      throw new Error('Order is missing required fields');
    }

    return {
      id: this.order.id,
      requestId: this.order.requestId,
      product: this.order.product,
      quantity: this.order.quantity,
      shippingAddress: this.order.shippingAddress,
      status: this.order.status ?? 'pending',
      totalPrice: this.order.product.price * this.order.quantity,
      createdAt: now,
      updatedAt: now,
      screenshotPath: this.order.screenshotPath,
    };
  }
}
