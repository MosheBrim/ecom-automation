import { Page } from 'playwright';
import { Address, PaymentMethod } from '../../domain/validators/schemas';
import { TOOLSHOP_SELECTORS } from '../selectors/toolshop.selectors';
import { createLogger } from '../../utils/logger';
import { withRetry } from '../../utils/withRetry';

export interface CheckoutResult {
  success: boolean;
  screenshotPath: string;
  orderTotal?: string;
  error?: string;
}

const TEST_PAYMENT_DATA = {
  bankTransfer: {
    bankName: process.env.PAYMENT_BANK_NAME ?? 'Test Bank',
    accountName: process.env.PAYMENT_ACCOUNT_NAME ?? 'Test Account',
    accountNumber: process.env.PAYMENT_ACCOUNT_NUMBER ?? '1234567890',
  },
  creditCard: {
    cardNumber: process.env.PAYMENT_CARD_NUMBER ?? '4111-1111-1111-1111',
    expirationDate: process.env.PAYMENT_EXPIRATION_DATE ?? '12/2030',
    cvv: process.env.PAYMENT_CVV ?? '123',
    cardHolderName: process.env.PAYMENT_CARD_HOLDER ?? 'Test User',
  },
} as const;

export async function proceedPastLogin(
  page: Page,
  requestId: string
): Promise<void> {
  const log = createLogger(requestId).withStep('proceed_past_login');
  const startTime = Date.now();

  await withRetry(
    async () => {
      await page.waitForSelector(TOOLSHOP_SELECTORS.CHECKOUT.PROCEED_AFTER_LOGIN, {
        state: 'visible',
        timeout: 10000,
      });
      await page.click(TOOLSHOP_SELECTORS.CHECKOUT.PROCEED_AFTER_LOGIN);

      await page.waitForSelector(TOOLSHOP_SELECTORS.CHECKOUT.STREET, {
        state: 'visible',
        timeout: 10000,
      });
    },
    requestId,
    'proceed_past_login'
  );

  log.success('Proceeded past login step', Date.now() - startTime);
}

export async function fillShippingAddress(
  page: Page,
  address: Address,
  requestId: string
): Promise<void> {
  const log = createLogger(requestId).withStep('fill_shipping');
  const startTime = Date.now();

  await withRetry(
    async () => {
      await page.waitForSelector(TOOLSHOP_SELECTORS.CHECKOUT.STREET, {
        state: 'visible',
        timeout: 10000,
      });

      const addressFields = [
        { selector: TOOLSHOP_SELECTORS.CHECKOUT.STREET, value: address.street },
        { selector: TOOLSHOP_SELECTORS.CHECKOUT.CITY, value: address.city },
        { selector: TOOLSHOP_SELECTORS.CHECKOUT.STATE, value: address.state },
        { selector: TOOLSHOP_SELECTORS.CHECKOUT.COUNTRY, value: address.country },
        { selector: TOOLSHOP_SELECTORS.CHECKOUT.POSTAL_CODE, value: address.postalCode },
      ];

      for (const { selector, value } of addressFields) {
        const locator = page.locator(selector);
        await locator.clear();
        await locator.fill(value);
      }

      await page.locator(TOOLSHOP_SELECTORS.CHECKOUT.POSTAL_CODE).press('Tab');

      await page.waitForSelector(
        `${TOOLSHOP_SELECTORS.CHECKOUT.PROCEED_TO_PAYMENT}:not([disabled])`,
        { state: 'visible', timeout: 5000 }
      );

      await page.click(TOOLSHOP_SELECTORS.CHECKOUT.PROCEED_TO_PAYMENT);

      await page.waitForSelector(TOOLSHOP_SELECTORS.CHECKOUT.PAYMENT_METHOD, {
        state: 'visible',
        timeout: 10000,
      });
    },
    requestId,
    'fill_shipping'
  );

  log.success('Shipping address filled', Date.now() - startTime);
}

export async function fillPaymentAndConfirm(
  page: Page,
  paymentMethod: PaymentMethod,
  requestId: string
): Promise<void> {
  const log = createLogger(requestId).withStep('fill_payment');
  const startTime = Date.now();

  await withRetry(
    async () => {
      await page.waitForSelector(TOOLSHOP_SELECTORS.CHECKOUT.PAYMENT_METHOD, {
        state: 'visible',
        timeout: 10000,
      });

      await page.selectOption(TOOLSHOP_SELECTORS.CHECKOUT.PAYMENT_METHOD, paymentMethod);

      if (paymentMethod === 'bank-transfer') {
        await page.waitForSelector(TOOLSHOP_SELECTORS.CHECKOUT.BANK_NAME, {
          state: 'visible',
          timeout: 5000,
        });
        await page.fill(TOOLSHOP_SELECTORS.CHECKOUT.BANK_NAME, TEST_PAYMENT_DATA.bankTransfer.bankName);
        await page.fill(TOOLSHOP_SELECTORS.CHECKOUT.ACCOUNT_NAME, TEST_PAYMENT_DATA.bankTransfer.accountName);
        await page.fill(TOOLSHOP_SELECTORS.CHECKOUT.ACCOUNT_NUMBER, TEST_PAYMENT_DATA.bankTransfer.accountNumber);
      }

      if (paymentMethod === 'credit-card') {
        await page.waitForSelector(TOOLSHOP_SELECTORS.CHECKOUT.CREDIT_CARD_NUMBER, {
          state: 'visible',
          timeout: 5000,
        });
        await page.fill(TOOLSHOP_SELECTORS.CHECKOUT.CREDIT_CARD_NUMBER, TEST_PAYMENT_DATA.creditCard.cardNumber);
        await page.fill(TOOLSHOP_SELECTORS.CHECKOUT.EXPIRATION_DATE, TEST_PAYMENT_DATA.creditCard.expirationDate);
        await page.fill(TOOLSHOP_SELECTORS.CHECKOUT.CVV, TEST_PAYMENT_DATA.creditCard.cvv);
        await page.fill(TOOLSHOP_SELECTORS.CHECKOUT.CARD_HOLDER_NAME, TEST_PAYMENT_DATA.creditCard.cardHolderName);
      }

      await page.click(TOOLSHOP_SELECTORS.CHECKOUT.CONFIRM_BUTTON);

      await page.waitForSelector(TOOLSHOP_SELECTORS.CHECKOUT.PAYMENT_SUCCESS, {
        state: 'visible',
        timeout: 30000,
      });
    },
    requestId,
    'fill_payment'
  );

  log.success('Payment completed', Date.now() - startTime);
}

