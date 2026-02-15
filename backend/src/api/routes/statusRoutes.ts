import { Router, Request, Response, NextFunction } from 'express';
import { statusService } from '../../services/StatusService';
import { AppError } from '../../domain/errors/AppError';

const router = Router();

router.get(
  '/:requestId',
  async (req: Request<{ requestId: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;
      const status = statusService.getStatus(requestId);

      if (!status) {
        throw new AppError({
          code: 'STATUS_NOT_FOUND',
          message: `Status not found for requestId: ${requestId}`,
          isRetryable: false,
        });
      }

      res.json({
        success: true,
        data: status,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as statusRoutes };
