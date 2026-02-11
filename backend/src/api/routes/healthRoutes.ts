import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    meta: {
      version: '1.0.0',
      environment: process.env.NODE_ENV ?? 'development',
    },
  });
});

export { router as healthRoutes };
