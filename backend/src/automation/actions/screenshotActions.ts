import { Page } from 'playwright';
import path from 'path';
import { createLogger } from '../../utils/logger';

const SCREENSHOTS_DIR = process.env.SCREENSHOTS_DIR ?? 'screenshots';

export async function takeScreenshot(
  page: Page,
  requestId: string,
  name: string
): Promise<string> {
  const log = createLogger(requestId).withStep('take_screenshot');
  const startTime = Date.now();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}_${requestId}_${timestamp}.png`;
  const filepath = path.resolve(process.cwd(), '..', SCREENSHOTS_DIR, filename);

  await page.screenshot({
    path: filepath,
    fullPage: true,
  });

  log.success(`Screenshot saved: ${filename}`, Date.now() - startTime);
  return filepath;
}

export async function takeCheckoutProof(
  page: Page,
  requestId: string
): Promise<string> {
  return takeScreenshot(page, requestId, 'checkout_proof');
}

export async function takeErrorScreenshot(
  page: Page,
  requestId: string,
  errorName: string
): Promise<string> {
  return takeScreenshot(page, requestId, `error_${errorName}`);
}
