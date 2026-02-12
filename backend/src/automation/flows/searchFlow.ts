import { Page } from 'playwright';
import { Product, SearchRequest } from '../../domain/validators/schemas';
import { TOOLSHOP_SELECTORS } from '../selectors/toolshop.selectors';
import { createLogger } from '../../utils/logger';
import { withRetry } from '../../utils/withRetry';
import { navigateToHome } from '../actions/navigationActions';
import { scrapeSearchResults } from '../actions/scrapeActions';

export async function executeSearch(
  page: Page,
  searchRequest: SearchRequest,
  requestId: string
): Promise<Product[]> {
  const log = createLogger(requestId).withStep('search');
  const startTime = Date.now();

  await navigateToHome(page, requestId);

  const hasResults = await withRetry(
    async () => {
      await page.waitForSelector(TOOLSHOP_SELECTORS.SEARCH.QUERY_INPUT, {
        state: 'visible',
        timeout: 10000,
      });

      await page.fill(TOOLSHOP_SELECTORS.SEARCH.QUERY_INPUT, searchRequest.query);
      await page.click(TOOLSHOP_SELECTORS.SEARCH.SUBMIT_BUTTON);

      const result = await Promise.race([
        page
          .waitForSelector(TOOLSHOP_SELECTORS.PRODUCT_CARD.CONTAINER, {
            state: 'visible',
            timeout: 15000,
          })
          .then(() => true),
        page
          .waitForSelector(TOOLSHOP_SELECTORS.SEARCH.NO_RESULTS, {
            state: 'visible',
            timeout: 15000,
          })
          .then(() => false),
      ]);

      return result;
    },
    requestId,
    'search_submit'
  );

  let products = hasResults
    ? await scrapeSearchResults(page, requestId, searchRequest.limit)
    : [];

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
