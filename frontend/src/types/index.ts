export interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  productUrl: string;
  imageUrl?: string;
  source: 'amazon';
  rating?: number;
  reviewCount?: number;
  isPrime?: boolean;
  inStock: boolean;
}

export interface SearchRequest {
  query: string;
  maxPrice?: number;
  minPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'relevance' | 'rating';
  limit?: number;
  selectionStrategy?: 'cheapest' | 'first' | 'highest_rated' | 'best_value';
}

export interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface CheckoutRequest {
  productId: string;
  quantity: number;
  shippingAddress: Address;
  product: Product;
  dryRun?: boolean;
}

export type AutomationStep =
  | 'initializing'
  | 'opening_browser'
  | 'logging_in'
  | 'searching'
  | 'scraping_results'
  | 'selecting_product'
  | 'adding_to_cart'
  | 'checkout'
  | 'filling_shipping'
  | 'confirming_order'
  | 'taking_screenshot'
  | 'completed'
  | 'failed';

export interface AutomationStatus {
  requestId: string;
  currentStep: AutomationStep;
  progress: number;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
  screenshotPath?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    step?: string;
  };
  meta: {
    requestId: string;
    timestamp: string;
  };
}

export interface SearchResponse {
  products: Product[];
  selectedProduct: Product | null;
}

export interface CheckoutResponse {
  order: {
    id: string;
    totalPrice: number;
    status: string;
  } | null;
  orderTotal?: string;
  screenshotPath?: string;
}
