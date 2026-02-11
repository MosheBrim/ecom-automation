import { Page } from 'playwright';
import { AMAZON_SELECTORS } from '../selectors/amazon.selectors';
import { createLogger } from '../../utils/logger';
import { withRetry } from '../../utils/withRetry';
import { AutomationError } from '../../domain/errors/AppError';

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function loginToAmazon(
  page: Page,
  credentials: LoginCredentials,
  requestId: string
): Promise<void> {
  const log = createLogger(requestId).withStep('login');
  const startTime = Date.now();

  await withRetry(
    async () => {
      await page.goto('https://www.amazon.com/ap/signin', {
        waitUntil: 'domcontentloaded',
      });

      await page.waitForSelector(AMAZON_SELECTORS.LOGIN.EMAIL_INPUT, {
        state: 'visible',
        timeout: 10000,
      });

      await page.fill(AMAZON_SELECTORS.LOGIN.EMAIL_INPUT, credentials.email);
      await page.click(AMAZON_SELECTORS.LOGIN.CONTINUE_BUTTON);

      await page.waitForSelector(AMAZON_SELECTORS.LOGIN.PASSWORD_INPUT, {
        state: 'visible',
        timeout: 10000,
      });

      await page.fill(AMAZON_SELECTORS.LOGIN.PASSWORD_INPUT, credentials.password);
      await page.click(AMAZON_SELECTORS.LOGIN.SIGN_IN_BUTTON);

      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 });

      const captcha = await page.$(AMAZON_SELECTORS.LOGIN.CAPTCHA_IMAGE);
      if (captcha) {
        throw new AutomationError('CAPTCHA detected during login', 'login', false);
      }

      const errorMessage = await page.$(AMAZON_SELECTORS.LOGIN.ERROR_MESSAGE);
      if (errorMessage) {
        const errorText = await errorMessage.textContent();
        throw new AutomationError(
          `Login failed: ${errorText ?? 'Unknown error'}`,
          'login',
          false
        );
      }
    },
    requestId,
    'login'
  );

  log.success('Successfully logged in', Date.now() - startTime);
}

export async function isLoggedIn(page: Page): Promise<boolean> {
  const accountElement = await page.$('#nav-link-accountList-nav-line-1');
  if (!accountElement) return false;

  const text = await accountElement.textContent();
  return text !== null && !text.includes('Sign in');
}

export async function ensureLoggedIn(
  page: Page,
  credentials: LoginCredentials,
  requestId: string
): Promise<void> {
  const log = createLogger(requestId);

  const loggedIn = await isLoggedIn(page);
  if (loggedIn) {
    log.info('Already logged in');
    return;
  }

  await loginToAmazon(page, credentials, requestId);
}
