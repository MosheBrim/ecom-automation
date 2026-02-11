import { Product as ProductType, ProductSchema } from '../validators/schemas';

export type { ProductType as Product };
export { ProductSchema };

export function createProduct(data: unknown): ProductType {
  return ProductSchema.parse(data);
}

export function isValidProduct(data: unknown): data is ProductType {
  return ProductSchema.safeParse(data).success;
}
