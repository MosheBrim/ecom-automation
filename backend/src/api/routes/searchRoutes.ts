import { Router, Request, Response, NextFunction } from 'express';
import { searchService } from '../../services/SearchService';
import { validateSearchRequest } from '../validators/requestValidators';
import { SearchRequest } from '../../domain/validators/schemas';

const router = Router();

interface SearchRequestBody extends SearchRequest {
  selectionStrategy?: 'cheapest' | 'first' | 'highest_rated' | 'best_value';
}

router.post(
  '/',
  validateSearchRequest,
  async (req: Request<object, object, SearchRequestBody>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { selectionStrategy = 'first', ...searchRequest } = req.body;

      const result = await searchService.search(
        searchRequest,
        req.requestId,
        selectionStrategy
      );

      res.json({
        success: true,
        data: {
          products: result.products,
          selectedProduct: result.selectedProduct,
        },
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
          totalProducts: result.products.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as searchRoutes };
