import { Router, Request, Response, NextFunction } from 'express';
import { checkoutService } from '../../services/CheckoutService';
import { validateCheckoutRequest } from '../validators/requestValidators';
import { CheckoutRequest, Product } from '../../domain/validators/schemas';
import { ValidationError } from '../../domain/errors/AppError';

const router = Router();

interface CheckoutRequestBody extends CheckoutRequest {
  product: Product;
  dryRun?: boolean;
}

router.post(
  '/',
  validateCheckoutRequest,
  async (req: Request<object, object, CheckoutRequestBody>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { product, dryRun = true, ...checkoutRequest } = req.body;

      if (!product) {
        throw new ValidationError('Product is required for checkout');
      }

      const result = await checkoutService.checkout(
        checkoutRequest,
        product,
        req.requestId,
        dryRun
      );

      res.json({
        success: result.checkoutResult.success,
        data: {
          order: result.order,
          orderTotal: result.checkoutResult.orderTotal,
          screenshotPath: result.checkoutResult.screenshotPath,
        },
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
          dryRun,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as checkoutRoutes };
