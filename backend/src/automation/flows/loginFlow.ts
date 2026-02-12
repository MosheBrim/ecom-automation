import { Page } from 'playwright';
import { TOOLSHOP_SELECTORS } from '../selectors/toolshop.selectors';
import { createLogger } from '../../utils/logger';
import { withRetry } from '../../utils/withRetry';
import { AutomationError } from '../../domain/errors/AppError';

export interface LoginCredentials {
  email: string;
  password: string;
}

const SITE_URL = process.env.SITE_URL ?? 'https://practicesoftwaretesting.com';

export async function loginToSite(
  page: Page,
  credentials: LoginCredentials,
  requestId: string
): Promise<void> {
  const log = createLogger(requestId).withStep('login');
  const startTime = Date.now();

  await withRetry(
    async () => {
      await page.goto(`${SITE_URL}/auth/login`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      const emailInput = page.locator(TOOLSHOP_SELECTORS.LOGIN.EMAIL_INPUT);
      await emailInput.waitFor({ state: 'visible', timeout: 15000 });

      await emailInput.fill(credentials.email);

      const passwordInput = page.locator(TOOLSHOP_SELECTORS.LOGIN.PASSWORD_INPUT);
      await passwordInput.waitFor({ state: 'visible', timeout: 15000 });
      await passwordInput.fill(credentials.password);

      await page.locator(TOOLSHOP_SELECTORS.LOGIN.SUBMIT_BUTTON).click();

      const navigationPromise = page
        .waitForURL(url => !url.toString().includes('/auth/login'), { timeout: 20000 })
        .then(() => 'success' as const);

      const errorLocator = page
        .locator(TOOLSHOP_SELECTORS.LOGIN.ERROR_MESSAGE)
        .or(page.locator('[data-test="email-error"]'))
        .or(page.locator('[data-test="password-error"]'));

      const errorPromise = errorLocator
        .waitFor({ state: 'visible', timeout: 20000 })
        .then(() => 'error' as const);

      navigationPromise.catch(() => {});
      errorPromise.catch(() => {});

      const result = await Promise.race([navigationPromise, errorPromise]);

      if (result === 'error') {
        const errorText = await errorLocator.first().textContent();
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
  const signOutElement = await page.$(TOOLSHOP_SELECTORS.NAV.SIGN_OUT);
  return signOutElement !== null;
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

  await loginToSite(page, credentials, requestId);
}
