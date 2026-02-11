import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { BrowserFactory } from './factories/BrowserFactory';
import { takeScreenshot } from './actions/screenshotActions';
import path from 'path';
import fs from 'fs';

describe('E2E Automation Tests', () => {
  let factory: BrowserFactory;

  beforeAll(() => {
    factory = BrowserFactory.getInstance({ headless: true });
  });

  afterAll(async () => {
    await factory.closeBrowser();
  });

  describe('BrowserFactory', () => {
    it('creates a browser instance', async () => {
      const browser = await factory.getBrowser();
      expect(browser).toBeDefined();
      expect(browser.isConnected()).toBe(true);
    });

    it('creates a page with context', async () => {
      const { page, context } = await factory.createPage();
      expect(page).toBeDefined();
      expect(context).toBeDefined();
      await context.close();
    });

    it('applies default viewport settings', async () => {
      const { page, context } = await factory.createPage();
      const viewport = page.viewportSize();
      expect(viewport?.width).toBe(1920);
      expect(viewport?.height).toBe(1080);
      await context.close();
    });
  });

  describe('Screenshot Functionality', () => {
    it('takes a screenshot and saves to file', async () => {
      const { page, context } = await factory.createPage();
      const requestId = 'test-e2e-screenshot';

      await page.setContent(`
        <html>
          <body style="background: #f0f0f0; padding: 20px;">
            <h1>E2E Test Page</h1>
            <p>This is a test page for screenshot verification.</p>
            <div style="margin-top: 20px; padding: 10px; background: white; border-radius: 8px;">
              <h2>Product: Test Item</h2>
              <p>Price: $99.99</p>
              <button style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px;">
                Add to Cart
              </button>
            </div>
          </body>
        </html>
      `);

      const screenshotPath = await takeScreenshot(page, requestId, 'e2e_test');

      expect(screenshotPath).toContain('e2e_test');
      expect(screenshotPath).toContain(requestId);
      expect(screenshotPath.endsWith('.png')).toBe(true);

      const fileExists = fs.existsSync(screenshotPath);
      expect(fileExists).toBe(true);

      if (fileExists) {
        fs.unlinkSync(screenshotPath);
      }

      await context.close();
    });
  });

  describe('Page Navigation', () => {
    it('navigates to a URL and waits for load', async () => {
      const { page, context } = await factory.createPage();

      await page.goto('data:text/html,<h1>Test</h1>');
      const content = await page.content();

      expect(content).toContain('<h1>Test</h1>');
      await context.close();
    });

    it('handles page timeouts gracefully', async () => {
      const { page, context } = await factory.createPage();
      page.setDefaultTimeout(100);

      await expect(
        page.waitForSelector('#non-existent-element', { timeout: 100 })
      ).rejects.toThrow();

      await context.close();
    });
  });

  describe('Form Interactions', () => {
    it('fills and submits a form', async () => {
      const { page, context } = await factory.createPage();

      await page.setContent(`
        <form id="test-form">
          <input type="text" id="search" name="search" />
          <button type="submit">Search</button>
        </form>
        <div id="result"></div>
        <script>
          document.getElementById('test-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const value = document.getElementById('search').value;
            document.getElementById('result').textContent = 'Searched: ' + value;
          });
        </script>
      `);

      await page.fill('#search', 'test product');
      await page.click('button[type="submit"]');

      const result = await page.textContent('#result');
      expect(result).toBe('Searched: test product');

      await context.close();
    });

    it('handles dynamic content loading', async () => {
      const { page, context } = await factory.createPage();

      await page.setContent(`
        <div id="container"></div>
        <script>
          setTimeout(() => {
            document.getElementById('container').innerHTML = '<span id="loaded">Content Loaded</span>';
          }, 50);
        </script>
      `);

      await page.waitForSelector('#loaded', { timeout: 5000 });
      const text = await page.textContent('#loaded');

      expect(text).toBe('Content Loaded');
      await context.close();
    });
  });

  describe('Product Selection Simulation', () => {
    it('selects products from a list', async () => {
      const { page, context } = await factory.createPage();

      await page.setContent(`
        <div class="products">
          <div class="product" data-price="29.99" data-id="1">Product A - $29.99</div>
          <div class="product" data-price="19.99" data-id="2">Product B - $19.99</div>
          <div class="product" data-price="39.99" data-id="3">Product C - $39.99</div>
        </div>
      `);

      const products = await page.$$eval('.product', (elements) =>
        elements.map((el) => ({
          id: el.getAttribute('data-id'),
          price: parseFloat(el.getAttribute('data-price') ?? '0'),
          text: el.textContent,
        }))
      );

      expect(products).toHaveLength(3);
      expect(products[0].price).toBe(29.99);

      const cheapest = products.reduce((min, p) => (p.price < min.price ? p : min));
      expect(cheapest.id).toBe('2');
      expect(cheapest.price).toBe(19.99);

      await context.close();
    });

    it('finds highest rated product', async () => {
      const { page, context } = await factory.createPage();

      await page.setContent(`
        <div class="products">
          <div class="product" data-rating="4.2" data-id="1">Product A - 4.2 stars</div>
          <div class="product" data-rating="4.8" data-id="2">Product B - 4.8 stars</div>
          <div class="product" data-rating="3.9" data-id="3">Product C - 3.9 stars</div>
        </div>
      `);

      const products = await page.$$eval('.product', (elements) =>
        elements.map((el) => ({
          id: el.getAttribute('data-id'),
          rating: parseFloat(el.getAttribute('data-rating') ?? '0'),
        }))
      );

      const highestRated = products.reduce((best, p) => (p.rating > best.rating ? p : best));
      expect(highestRated.id).toBe('2');
      expect(highestRated.rating).toBe(4.8);

      await context.close();
    });
  });

  describe('Checkout Form Simulation', () => {
    it('fills checkout form with address', async () => {
      const { page, context } = await factory.createPage();

      await page.setContent(`
        <form id="checkout-form">
          <input id="fullName" type="text" />
          <input id="address1" type="text" />
          <input id="city" type="text" />
          <input id="state" type="text" />
          <input id="zip" type="text" />
          <button type="submit">Place Order</button>
        </form>
        <div id="confirmation" style="display:none;">Order Confirmed!</div>
        <script>
          document.getElementById('checkout-form').addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('confirmation').style.display = 'block';
          });
        </script>
      `);

      await page.fill('#fullName', 'John Doe');
      await page.fill('#address1', '123 Main St');
      await page.fill('#city', 'New York');
      await page.fill('#state', 'NY');
      await page.fill('#zip', '10001');
      await page.click('button[type="submit"]');

      await page.waitForSelector('#confirmation', { state: 'visible' });
      const confirmation = await page.textContent('#confirmation');
      expect(confirmation).toBe('Order Confirmed!');

      await context.close();
    });
  });

  describe('Multi-step Flow Simulation', () => {
    it('completes search to checkout flow', async () => {
      const { page, context } = await factory.createPage();

      await page.setContent(`
        <div id="step-search" class="step active">
          <input id="search-input" type="text" />
          <button id="search-btn">Search</button>
        </div>
        <div id="step-results" class="step" style="display:none;">
          <div class="product" data-id="1">Product 1 - $29.99</div>
          <button id="add-to-cart">Add to Cart</button>
        </div>
        <div id="step-cart" class="step" style="display:none;">
          <p>Cart: 1 item</p>
          <button id="checkout-btn">Checkout</button>
        </div>
        <div id="step-complete" class="step" style="display:none;">
          <h2>Order Complete!</h2>
        </div>
        <script>
          document.getElementById('search-btn').onclick = () => {
            document.getElementById('step-search').style.display = 'none';
            document.getElementById('step-results').style.display = 'block';
          };
          document.getElementById('add-to-cart').onclick = () => {
            document.getElementById('step-results').style.display = 'none';
            document.getElementById('step-cart').style.display = 'block';
          };
          document.getElementById('checkout-btn').onclick = () => {
            document.getElementById('step-cart').style.display = 'none';
            document.getElementById('step-complete').style.display = 'block';
          };
        </script>
      `);

      await page.fill('#search-input', 'test product');
      await page.click('#search-btn');
      await page.waitForSelector('#step-results', { state: 'visible' });

      await page.click('#add-to-cart');
      await page.waitForSelector('#step-cart', { state: 'visible' });

      await page.click('#checkout-btn');
      await page.waitForSelector('#step-complete', { state: 'visible' });

      const completeText = await page.textContent('#step-complete h2');
      expect(completeText).toBe('Order Complete!');

      await context.close();
    });
  });

  describe('Browser Context Management', () => {
    it('tracks active context count', async () => {
      const { context: context1 } = await factory.createPage();
      const { context: context2 } = await factory.createPage();

      expect(factory.getActiveContextCount()).toBeGreaterThanOrEqual(2);

      await context1.close();
      await context2.close();
    });

    it('browser stays connected across multiple contexts', async () => {
      const { context: context1 } = await factory.createPage();
      expect(factory.isConnected()).toBe(true);

      const { context: context2 } = await factory.createPage();
      expect(factory.isConnected()).toBe(true);

      await context1.close();
      expect(factory.isConnected()).toBe(true);

      await context2.close();
      expect(factory.isConnected()).toBe(true);
    });
  });
});
