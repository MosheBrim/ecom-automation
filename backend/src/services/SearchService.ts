import { Page, BrowserContext } from 'playwright';
import { Product, SearchRequest } from '../domain/validators/schemas';
import { browserFactory } from '../automation/factories/BrowserFactory';
import { executeSearch } from '../automation/flows/searchFlow';
import { createLogger } from '../utils/logger';
import { statusService } from './StatusService';
import { createSelectionStrategy, SelectionStrategyType } from '../domain/strategies/ProductSelectionStrategy';

export interface SearchResult {
  requestId: string;
  products: Product[];
  selectedProduct: Product | null;
  screenshotPath?: string;
}

export class SearchService {
  async search(
    searchRequest: SearchRequest,
    requestId: string,
    selectionStrategy: SelectionStrategyType = 'first'
  ): Promise<SearchResult> {
    const log = createLogger(requestId);
    let page: Page | null = null;
    let context: BrowserContext | null = null;

    try {
      statusService.createStatus(requestId);
      statusService.updateStatus(requestId, 'opening_browser', 10);

      const browserResult = await browserFactory.createPage();
      page = browserResult.page;
      context = browserResult.context;

      statusService.updateStatus(requestId, 'searching', 30);
      log.info('Starting search', { query: searchRequest.query });

      const products = await executeSearch(page, searchRequest, requestId);

      statusService.updateStatus(requestId, 'scraping_results', 60);

      const strategy = createSelectionStrategy(selectionStrategy);
      const selectedProduct = strategy.select(products);

      statusService.updateStatus(requestId, 'selecting_product', 80);

      statusService.completeStatus(requestId);
      log.info('Search completed', { productCount: products.length });

      return {
        requestId,
        products,
        selectedProduct,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.error(`Search failed: ${errorMessage}`);
      statusService.failStatus(requestId, errorMessage);
      throw error;
    } finally {
      if (context) {
        await context.close();
      }
    }
  }
}

export const searchService = new SearchService();
