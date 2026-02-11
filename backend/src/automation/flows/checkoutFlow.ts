import { Page } from 'playwright';
import { Address } from '../../domain/validators/schemas';
import { AMAZON_SELECTORS } from '../selectors/amazon.selectors';
import { createLogger } from '../../utils/logger';
import { withRetry } from '../../utils/withRetry';
import { takeCheckoutProof } from '../actions/screenshotActions';

export interface CheckoutResult {
  success: boolean;
  screenshotPath: string;
  orderTotal?: string;
  error?: string;
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
      const addNewAddress = await page.$(AMAZON_SELECTORS.CHECKOUT.ADD_NEW_ADDRESS);
      if (addNewAddress) {
        await addNewAddress.click();
        await page.waitForSelector(AMAZON_SELECTORS.CHECKOUT.FULL_NAME, {
          state: 'visible',
          timeout: 10000,
        });
      }

      const fullNameInput = await page.$(AMAZON_SELECTORS.CHECKOUT.FULL_NAME);
      if (fullNameInput) {
        await page.fill(AMAZON_SELECTORS.CHECKOUT.FULL_NAME, address.fullName);
        await page.fill(AMAZON_SELECTORS.CHECKOUT.ADDRESS_LINE_1, address.addressLine1);

        if (address.addressLine2) {
          await page.fill(AMAZON_SELECTORS.CHECKOUT.ADDRESS_LINE_2, address.addressLine2);
        }

        await page.fill(AMAZON_SELECTORS.CHECKOUT.CITY, address.city);
        await page.fill(AMAZON_SELECTORS.CHECKOUT.STATE, address.state);
        await page.fill(AMAZON_SELECTORS.CHECKOUT.ZIP_CODE, address.zipCode);

        if (address.phone) {
          await page.fill(AMAZON_SELECTORS.CHECKOUT.PHONE, address.phone);
        }

        const useAddressButton = await page.$(AMAZON_SELECTORS.CHECKOUT.USE_THIS_ADDRESS);
        if (useAddressButton) {
          await useAddressButton.click();
        }
      }
    },
    requestId,
    'fill_shipping'
  );

  log.success('Shipping address filled', Date.now() - startTime);
}

export async function completeCheckout(
  page: Page,
  address: Address,
  requestId: string,
  dryRun: boolean = true
): Promise<CheckoutResult> {
  const log = createLogger(requestId).withStep('checkout');
  const startTime = Date.now();

  try {
    await fillShippingAddress(page, address, requestId);

    const orderTotalElement = await page.$(AMAZON_SELECTORS.CHECKOUT.ORDER_TOTAL);
    const orderTotal = await orderTotalElement?.textContent();

    if (dryRun) {
      log.info('Dry run mode - not placing actual order');
      const screenshotPath = await takeCheckoutProof(page, requestId);

      log.success('Checkout completed (dry run)', Date.now() - startTime);
      return {
        success: true,
        screenshotPath,
        orderTotal: orderTotal?.trim(),
      };
    }

    await withRetry(
      async () => {
        const placeOrderButton = await page.$(AMAZON_SELECTORS.CHECKOUT.PLACE_ORDER_BUTTON);
        if (placeOrderButton) {
          await placeOrderButton.click();
          await page.waitForSelector(AMAZON_SELECTORS.CHECKOUT.CONFIRMATION_MESSAGE, {
            state: 'visible',
            timeout: 30000,
          });
        }
      },
      requestId,
      'place_order'
    );

    const screenshotPath = await takeCheckoutProof(page, requestId);

    log.success('Checkout completed', Date.now() - startTime);
    return {
      success: true,
      screenshotPath,
      orderTotal: orderTotal?.trim(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error(`Checkout failed: ${errorMessage}`);

    const screenshotPath = await takeCheckoutProof(page, requestId);

    return {
      success: false,
      screenshotPath,
      error: errorMessage,
    };
  }
}
