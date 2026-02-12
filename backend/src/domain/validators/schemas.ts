import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  price: z.number().positive(),
  currency: z.string().default('USD'),
  productUrl: z.string().url(),
  imageUrl: z.string().url().optional(),
  source: z.enum(['toolshop']).default('toolshop'),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().nonnegative().optional(),
  inStock: z.boolean().default(true),
});

export const SearchRequestSchema = z.object({
  query: z.string().min(1).max(200),
  maxPrice: z.number().positive().optional(),
  minPrice: z.number().nonnegative().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'relevance', 'rating']).default('relevance'),
  limit: z.number().int().min(1).max(50).default(20),
  selectionStrategy: z.enum(['cheapest', 'first', 'highest_rated', 'best_value']).default('first'),
});

export const PaymentMethodSchema = z.enum([
  'bank-transfer',
  'cash-on-delivery',
  'credit-card',
  'buy-now-pay-later',
  'gift-card',
]);

export const AddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  postalCode: z.string().min(1),
});

export const CheckoutRequestSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  shippingAddress: AddressSchema,
  paymentMethod: PaymentMethodSchema.default('bank-transfer'),
});

export const BuyRequestSchema = z.object({
  product: ProductSchema,
  quantity: z.number().int().positive().default(1),
});

export const AutomationStepSchema = z.enum([
  'initializing',
  'opening_browser',
  'logging_in',
  'searching',
  'scraping_results',
  'selecting_product',
  'adding_to_cart',
  'checkout',
  'filling_shipping',
  'filling_payment',
  'confirming_order',
  'taking_screenshot',
  'completed',
  'failed',
]);

export const StepRecordSchema = z.object({
  step: AutomationStepSchema,
  startedAt: z.date(),
  completedAt: z.date().optional(),
  duration: z.number().optional(),
});

export const AutomationStatusSchema = z.object({
  requestId: z.string(),
  currentStep: AutomationStepSchema,
  progress: z.number().min(0).max(100),
  startedAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional(),
  error: z.string().optional(),
  screenshotPath: z.string().optional(),
  steps: z.array(StepRecordSchema).default([]),
  result: z.record(z.unknown()).optional(),
});

export type Product = z.infer<typeof ProductSchema>;
export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type BuyRequest = z.infer<typeof BuyRequestSchema>;
export type AutomationStep = z.infer<typeof AutomationStepSchema>;
export type StepRecord = z.infer<typeof StepRecordSchema>;
export type AutomationStatus = z.infer<typeof AutomationStatusSchema>;
