import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  price: z.number().positive(),
  currency: z.string().default('USD'),
  productUrl: z.string().url(),
  imageUrl: z.string().url().optional(),
  source: z.enum(['amazon']).default('amazon'),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().nonnegative().optional(),
  isPrime: z.boolean().optional(),
  inStock: z.boolean().default(true),
});

export const SearchRequestSchema = z.object({
  query: z.string().min(1).max(200),
  maxPrice: z.number().positive().optional(),
  minPrice: z.number().nonnegative().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'relevance', 'rating']).default('relevance'),
  limit: z.number().int().min(1).max(50).default(20),
});

export const AddressSchema = z.object({
  fullName: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().default('US'),
  phone: z.string().optional(),
});

export const CheckoutRequestSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  shippingAddress: AddressSchema,
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
  'confirming_order',
  'taking_screenshot',
  'completed',
  'failed',
]);

export const AutomationStatusSchema = z.object({
  requestId: z.string().uuid(),
  currentStep: AutomationStepSchema,
  progress: z.number().min(0).max(100),
  startedAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional(),
  error: z.string().optional(),
  screenshotPath: z.string().optional(),
});

export type Product = z.infer<typeof ProductSchema>;
export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;
export type AutomationStep = z.infer<typeof AutomationStepSchema>;
export type AutomationStatus = z.infer<typeof AutomationStatusSchema>;
