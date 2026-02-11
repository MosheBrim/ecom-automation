import { Product, SearchRequest } from '../domain/validators/schemas';
import { executeSearchFlow } from '../automation/orchestrators/searchOrchestrator';
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

    try {
      statusService.createStatus(requestId);

      const { products } = await executeSearchFlow(
        searchRequest,
        requestId,
        (step, progress) => statusService.updateStatus(requestId, step, progress)
      );

      statusService.updateStatus(requestId, 'selecting_product', 80);
      const strategy = createSelectionStrategy(selectionStrategy);
      const selectedProduct = strategy.select(products);

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
    }
  }
}

export const searchService = new SearchService();
