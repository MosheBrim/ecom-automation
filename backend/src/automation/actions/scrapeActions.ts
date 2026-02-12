import { Page } from 'playwright';
import { Product } from '../../domain/validators/schemas';
import { TOOLSHOP_SELECTORS } from '../selectors/toolshop.selectors';
import { createLogger } from '../../utils/logger';
import { extractPriceFromText } from '../../utils/formatPrice';

const TOOLSHOP_BASE_URL = process.env.SITE_URL ?? 'https://practicesoftwaretesting.com';

export async function scrapeSearchResults(
  page: Page,
  requestId: string,
  limit: number = 20
): Promise<Product[]> {
  const log = createLogger(requestId).withStep('scrape_results');
  const startTime = Date.now();

  await page.waitForSelector(TOOLSHOP_SELECTORS.PRODUCT_CARD.CONTAINER, {
    state: 'visible',
    timeout: 10000,
  });

  const products: Product[] = [];
  const cards = await page.$$(TOOLSHOP_SELECTORS.PRODUCT_CARD.CONTAINER);

  for (const card of cards.slice(0, limit)) {
    try {
      const product = await extractProductFromCard(card);
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

async function extractProductFromCard(
  card: ReturnType<Page['$']> extends Promise<infer T> ? T : never
): Promise<Product | null> {
  if (!card) return null;

  const href = await card.getAttribute('href');
  if (!href) return null;

  const idMatch = href.match(/\/product\/([^/?#]+)/);
  const id = idMatch ? idMatch[1] : href;

  const nameElement = await card.$(TOOLSHOP_SELECTORS.PRODUCT_CARD.NAME);
  const title = await nameElement?.textContent();
  if (!title?.trim()) return null;

  const priceElement = await card.$(TOOLSHOP_SELECTORS.PRODUCT_CARD.PRICE);
  const priceText = await priceElement?.textContent();
  const price = priceText ? extractPriceFromText(priceText) : null;
  if (price === null) return null;

  const imageElement = await card.$('img');
  const rawImageUrl = await imageElement?.getAttribute('src');
  const imageUrl = rawImageUrl
    ? rawImageUrl.startsWith('http')
      ? rawImageUrl
      : `${TOOLSHOP_BASE_URL}/${rawImageUrl.replace(/^\//, '')}`
    : undefined;

  const productUrl = href.startsWith('http') ? href : `${TOOLSHOP_BASE_URL}${href}`;

  const outOfStockElement = await card.$(TOOLSHOP_SELECTORS.PRODUCT_CARD.OUT_OF_STOCK);
  const inStock = outOfStockElement === null;

  return {
    id,
    title: title.trim(),
    price,
    currency: 'USD',
    productUrl,
    imageUrl,
    source: 'toolshop',
    inStock,
  };
}

export async function scrapeProductDetails(
  page: Page,
  requestId: string
): Promise<Partial<Product>> {
  const log = createLogger(requestId).withStep('scrape_product_details');
  const startTime = Date.now();

  await page.waitForSelector(TOOLSHOP_SELECTORS.PRODUCT_DETAIL.NAME, {
    state: 'visible',
    timeout: 10000,
  });

  const titleElement = await page.$(TOOLSHOP_SELECTORS.PRODUCT_DETAIL.NAME);
  const title = await titleElement?.textContent();

  const priceElement = await page.$(TOOLSHOP_SELECTORS.PRODUCT_DETAIL.PRICE);
  const priceText = await priceElement?.textContent();
  const price = priceText ? extractPriceFromText(priceText) : null;

  const outOfStockElement = await page.$(TOOLSHOP_SELECTORS.PRODUCT_DETAIL.OUT_OF_STOCK);
  const inStock = outOfStockElement === null;

  log.success('Scraped product details', Date.now() - startTime);

  return {
    title: title?.trim(),
    price: price ?? undefined,
    inStock,
  };
}
