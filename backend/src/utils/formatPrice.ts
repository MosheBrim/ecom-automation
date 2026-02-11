export interface PriceFormatOptions {
  currency?: string;
  locale?: string;
}

export function formatPrice(amount: number, options: PriceFormatOptions = {}): string {
  const { currency = 'USD', locale = 'en-US' } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function parsePrice(priceString: string): number | null {
  const cleanedString = priceString.replace(/[^0-9.,]/g, '');
  const normalizedString = cleanedString.replace(',', '.');
  const parsed = parseFloat(normalizedString);
  return isNaN(parsed) ? null : parsed;
}

export function extractPriceFromText(text: string): number | null {
  const priceMatch = text.match(/\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?/);
  if (!priceMatch) return null;
  return parsePrice(priceMatch[0]);
}
