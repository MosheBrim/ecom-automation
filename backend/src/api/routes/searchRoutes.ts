import { Router, Request, Response, NextFunction } from 'express';
import { searchService } from '../../services/SearchService';
import { validateSearchRequest } from '../validators/requestValidators';
import { SearchRequest } from '../../domain/validators/schemas';

const router = Router();

router.post(
  '/',
  validateSearchRequest,
  async (req: Request<object, object, SearchRequest>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { selectionStrategy, ...searchParams } = req.body;

      const result = await searchService.search(
        searchParams,
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
