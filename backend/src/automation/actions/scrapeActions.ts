import { Page } from 'playwright';
import { Product } from '../../domain/validators/schemas';
import { AMAZON_SELECTORS } from '../selectors/amazon.selectors';
import { createLogger } from '../../utils/logger';
import { parsePrice } from '../../utils/formatPrice';

export async function scrapeSearchResults(
  page: Page,
  requestId: string,
  limit: number = 20
): Promise<Product[]> {
  const log = createLogger(requestId).withStep('scrape_results');
  const startTime = Date.now();

  await page.waitForSelector(AMAZON_SELECTORS.SEARCH.RESULTS_CONTAINER, {
    state: 'visible',
    timeout: 10000,
  });

  const products: Product[] = [];
  const items = await page.$$(AMAZON_SELECTORS.SEARCH.RESULT_ITEM);

  for (const item of items.slice(0, limit)) {
    try {
      const product = await extractProductFromElement(item, page);
      if (product) {
        products.push(product);
      }
    } catch {
      continue;
    }
  }

  log.success(`Scraped ${products.length} products`, Date.now() - startTime);
  return products;
}

async function extractProductFromElement(
  element: ReturnType<Page['$']> extends Promise<infer T> ? T : never,
  page: Page
): Promise<Product | null> {
  if (!element) return null;

  const asin = await element.getAttribute('data-asin');
  if (!asin) return null;

  const titleElement = await element.$(AMAZON_SELECTORS.PRODUCT.TITLE);
  const title = await titleElement?.textContent();
  if (!title?.trim()) return null;

  const priceWhole = await element.$(AMAZON_SELECTORS.PRODUCT.PRICE_WHOLE);
  const priceFraction = await element.$(AMAZON_SELECTORS.PRODUCT.PRICE_FRACTION);
  const wholeText = await priceWhole?.textContent();
  const fractionText = await priceFraction?.textContent();

  let price: number | null = null;
  if (wholeText) {
    const priceString = `${wholeText.replace(/[^0-9]/g, '')}.${fractionText ?? '00'}`;
    price = parsePrice(priceString);
  }

  if (price === null) return null;

  const linkElement = await element.$(AMAZON_SELECTORS.PRODUCT.LINK);
  const href = await linkElement?.getAttribute('href');
  const productUrl = href ? `https://www.amazon.com${href}` : '';

  const imageElement = await element.$(AMAZON_SELECTORS.PRODUCT.IMAGE);
  const imageUrl = await imageElement?.getAttribute('src');

  const ratingElement = await element.$(AMAZON_SELECTORS.PRODUCT.RATING);
  const ratingText = await ratingElement?.textContent();
  const rating = ratingText ? parseFloat(ratingText.split(' ')[0]) : undefined;

  const primeElement = await element.$(AMAZON_SELECTORS.PRODUCT.PRIME_BADGE);
  const isPrime = primeElement !== null;

  return {
    id: asin,
    title: title.trim(),
    price,
    currency: 'USD',
    productUrl,
    imageUrl: imageUrl ?? undefined,
    source: 'amazon',
    rating,
    isPrime,
    inStock: true,
  };
}

export async function scrapeProductDetails(
  page: Page,
  requestId: string
): Promise<Partial<Product>> {
  const log = createLogger(requestId).withStep('scrape_product_details');
  const startTime = Date.now();

  await page.waitForSelector(AMAZON_SELECTORS.PRODUCT_PAGE.TITLE, {
    state: 'visible',
    timeout: 10000,
  });

  const titleElement = await page.$(AMAZON_SELECTORS.PRODUCT_PAGE.TITLE);
  const title = await titleElement?.textContent();

  const priceElement = await page.$(AMAZON_SELECTORS.PRODUCT_PAGE.PRICE);
  const priceText = await priceElement?.textContent();
  const price = priceText ? parsePrice(priceText) : null;

  const stockElement = await page.$(AMAZON_SELECTORS.PRODUCT_PAGE.IN_STOCK);
  const stockText = await stockElement?.textContent();
  const inStock = stockText?.toLowerCase().includes('in stock') ?? false;

  log.success('Scraped product details', Date.now() - startTime);

  return {
    title: title?.trim(),
    price: price ?? undefined,
    inStock,
  };
}
