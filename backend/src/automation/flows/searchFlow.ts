import { Page } from 'playwright';
import { Product, SearchRequest } from '../../domain/validators/schemas';
import { AMAZON_SELECTORS } from '../selectors/amazon.selectors';
import { createLogger } from '../../utils/logger';
import { withRetry } from '../../utils/withRetry';
import { navigateToAmazon } from '../actions/navigationActions';
import { scrapeSearchResults } from '../actions/scrapeActions';

export async function executeSearch(
  page: Page,
  searchRequest: SearchRequest,
  requestId: string
): Promise<Product[]> {
  const log = createLogger(requestId).withStep('search');
  const startTime = Date.now();

  await navigateToAmazon(page, requestId);

  await withRetry(
    async () => {
      await page.waitForSelector(AMAZON_SELECTORS.SEARCH.SEARCH_INPUT, {
        state: 'visible',
        timeout: 10000,
      });

      await page.fill(AMAZON_SELECTORS.SEARCH.SEARCH_INPUT, searchRequest.query);
      await page.click(AMAZON_SELECTORS.SEARCH.SEARCH_BUTTON);

      await page.waitForSelector(AMAZON_SELECTORS.SEARCH.RESULTS_CONTAINER, {
        state: 'visible',
        timeout: 15000,
      });
    },
    requestId,
    'search_submit'
  );

  let products = await scrapeSearchResults(page, requestId, searchRequest.limit);

  if (searchRequest.maxPrice !== undefined) {
    products = products.filter(p => p.price <= searchRequest.maxPrice!);
  }

  if (searchRequest.minPrice !== undefined) {
    products = products.filter(p => p.price >= searchRequest.minPrice!);
  }

  products = sortProducts(products, searchRequest.sortBy);

  log.success(`Search completed with ${products.length} results`, Date.now() - startTime);
  return products;
}

function sortProducts(
  products: Product[],
  sortBy: SearchRequest['sortBy']
): Product[] {
  switch (sortBy) {
    case 'price_asc':
      return [...products].sort((a, b) => a.price - b.price);
    case 'price_desc':
      return [...products].sort((a, b) => b.price - a.price);
    case 'rating':
      return [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case 'relevance':
    default:
      return products;
  }
}
