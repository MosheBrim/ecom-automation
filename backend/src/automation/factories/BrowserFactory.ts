import { Browser, BrowserContext, Page, chromium } from 'playwright';

export interface BrowserConfig {
  headless: boolean;
  slowMo: number;
  defaultTimeout: number;
  viewport: { width: number; height: number };
  maxContexts: number;
}

const DEFAULT_CONFIG: BrowserConfig = {
  headless: process.env.HEADLESS === 'true',
  slowMo: parseInt(process.env.SLOW_MO ?? '0', 10),
  defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT ?? '30000', 10),
  viewport: { width: 1920, height: 1080 },
  maxContexts: parseInt(process.env.MAX_BROWSER_CONTEXTS ?? '5', 10),
};

export class BrowserFactory {
  private static instance: BrowserFactory | null = null;
  private browser: Browser | null = null;
  private config: BrowserConfig;
  private activeContexts: Set<BrowserContext> = new Set();

  private constructor(config: BrowserConfig) {
    this.config = config;
  }

  static getInstance(config: Partial<BrowserConfig> = {}): BrowserFactory {
    if (!BrowserFactory.instance) {
      BrowserFactory.instance = new BrowserFactory({ ...DEFAULT_CONFIG, ...config });
    }
    return BrowserFactory.instance;
  }

  static resetInstance(): void {
    if (BrowserFactory.instance) {
      BrowserFactory.instance.closeBrowser();
      BrowserFactory.instance = null;
    }
  }

  async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.isConnected()) {
      this.browser = await chromium.launch({
        headless: this.config.headless,
        slowMo: this.config.slowMo,
      });

      this.browser.on('disconnected', () => {
        this.browser = null;
        this.activeContexts.clear();
      });
    }
    return this.browser;
  }

  async createContext(): Promise<BrowserContext> {
    if (this.activeContexts.size >= this.config.maxContexts) {
      const oldestContext = this.activeContexts.values().next().value;
      if (oldestContext) {
        await this.closeContext(oldestContext);
      }
    }

    const browser = await this.getBrowser();
    const context = await browser.newContext({
      viewport: this.config.viewport,
      userAgent: this.getUserAgent(),
      locale: 'en-US',
      timezoneId: 'America/New_York',
    });

    this.activeContexts.add(context);

    context.on('close', () => {
      this.activeContexts.delete(context);
    });

    return context;
  }

  async createPage(): Promise<{ page: Page; context: BrowserContext }> {
    const context = await this.createContext();
    const page = await context.newPage();
    page.setDefaultTimeout(this.config.defaultTimeout);
    return { page, context };
  }

  async closeContext(context: BrowserContext): Promise<void> {
    if (this.activeContexts.has(context)) {
      this.activeContexts.delete(context);
      await context.close();
    }
  }

  async closeBrowser(): Promise<void> {
    for (const context of this.activeContexts) {
      await context.close();
    }
    this.activeContexts.clear();

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  getActiveContextCount(): number {
    return this.activeContexts.size;
  }

  isConnected(): boolean {
    return this.browser?.isConnected() ?? false;
  }

  private getUserAgent(): string {
    return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }
}

export const browserFactory = BrowserFactory.getInstance();
