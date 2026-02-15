import { Router, Request, Response, NextFunction } from 'express';
import { checkoutService } from '../../services/CheckoutService';
import { statusService } from '../../services/StatusService';
import { validateBuyRequest } from '../validators/requestValidators';
import { BuyRequest } from '../../domain/validators/schemas';
import { createLogger } from '../../utils/logger';

const router = Router();

router.post(
  '/',
  validateBuyRequest,
  async (req: Request<object, object, BuyRequest>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { product, quantity = 1 } = req.body;
      const log = createLogger(req.requestId);

      statusService.createStatus(req.requestId);

      res.json({
        success: true,
        data: { requestId: req.requestId },
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      });

      log.info('Checkout started in background', { productId: product.id });

      checkoutService.checkout(product, quantity, req.requestId).catch((error) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        log.error(`Background checkout failed: ${errorMessage}`);
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as checkoutRoutes };
