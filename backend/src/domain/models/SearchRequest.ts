import { SearchRequest as SearchRequestType, SearchRequestSchema } from '../validators/schemas';

export type { SearchRequestType as SearchRequest };
export { SearchRequestSchema };

export function createSearchRequest(data: unknown): SearchRequestType {
  return SearchRequestSchema.parse(data);
}

export function isValidSearchRequest(data: unknown): data is SearchRequestType {
  return SearchRequestSchema.safeParse(data).success;
}
