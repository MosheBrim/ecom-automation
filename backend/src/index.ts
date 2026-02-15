import express from 'express';
import helmet from 'helmet';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../.env') });

import {
  requestIdMiddleware,
  corsMiddleware,
  errorHandler,
  searchRoutes,
  checkoutRoutes,
  statusRoutes,
  healthRoutes,
} from './api';
import { logger } from './utils/logger';
import { browserFactory } from './automation/factories/BrowserFactory';

const PORT = process.env.PORT ?? 3001;
const NODE_ENV = process.env.NODE_ENV ?? 'development';

const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(express.json());
app.use(requestIdMiddleware);

app.use('/api/health', healthRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/status', statusRoutes);

const screenshotsDir = path.resolve(__dirname, '..', '..', process.env.SCREENSHOTS_DIR ?? 'screenshots');
app.use('/api/screenshots', express.static(screenshotsDir));

app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`, {
    environment: NODE_ENV,
    port: PORT,
  });
});

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, shutting down gracefully`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await browserFactory.closeBrowser();
      logger.info('Browser closed');
    } catch (error) {
      logger.error('Error closing browser', { error });
    }

    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export { app };
