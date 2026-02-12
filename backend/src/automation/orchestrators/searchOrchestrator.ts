import { Product, SearchRequest } from '../../domain/validators/schemas';
import { AutomationStep } from '../../domain/models/AutomationStatus';
import { browserFactory } from '../factories/BrowserFactory';
import { executeSearch } from '../flows/searchFlow';
import { createLogger } from '../../utils/logger';

export interface SearchOrchestratorResult {
  products: Product[];
}

export type ProgressCallback = (step: AutomationStep, progress: number) => void;

export async function executeSearchFlow(
  searchRequest: Omit<SearchRequest, 'selectionStrategy'>,
  requestId: string,
  onProgress?: ProgressCallback
): Promise<SearchOrchestratorResult> {
  const log = createLogger(requestId);
  let context: { close: () => Promise<void> } | null = null;

  try {
    onProgress?.('opening_browser', 10);
    const browserResult = await browserFactory.createPage();
    context = browserResult.context;

    onProgress?.('searching', 30);
    log.info('Starting search', { query: searchRequest.query });

    const products = await executeSearch(browserResult.page, searchRequest, requestId);

    onProgress?.('scraping_results', 60);
    log.info('Search completed', { productCount: products.length });

    return { products };
  } finally {
    if (context) {
      await context.close();
    }
  }
}
