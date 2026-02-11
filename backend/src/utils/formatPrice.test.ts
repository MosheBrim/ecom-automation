import { describe, it, expect } from 'vitest';
import { formatPrice, parsePrice, extractPriceFromText } from './formatPrice';

describe('formatPrice', () => {
  it('formats price with default USD currency', () => {
    expect(formatPrice(99.99)).toBe('$99.99');
  });

  it('formats price with custom currency', () => {
    expect(formatPrice(99.99, { currency: 'EUR', locale: 'de-DE' })).toContain('99,99');
  });

  it('formats whole numbers with two decimal places', () => {
    expect(formatPrice(100)).toBe('$100.00');
  });

  it('formats large numbers with proper grouping', () => {
    expect(formatPrice(1234.56)).toBe('$1,234.56');
  });
});

describe('parsePrice', () => {
  it('parses price string with dollar sign', () => {
    expect(parsePrice('$99.99')).toBe(99.99);
  });

  it('parses price string without dollar sign', () => {
    expect(parsePrice('99.99')).toBe(99.99);
  });

  it('parses price with comma as decimal separator', () => {
    expect(parsePrice('99,99')).toBe(99.99);
  });

  it('returns null for invalid price string', () => {
    expect(parsePrice('invalid')).toBe(null);
  });

  it('handles empty string', () => {
    expect(parsePrice('')).toBe(null);
  });

  it('parses price with extra characters', () => {
    expect(parsePrice('Price: $49.99 USD')).toBe(49.99);
  });
});

describe('extractPriceFromText', () => {
  it('extracts price from text with dollar sign', () => {
    expect(extractPriceFromText('The price is $29.99 today')).toBe(29.99);
  });

  it('extracts price from text without dollar sign', () => {
    expect(extractPriceFromText('Price: 149.99')).toBe(149.99);
  });

  it('extracts three-digit price', () => {
    expect(extractPriceFromText('Total: $299.99')).toBe(299.99);
  });

  it('returns null when no price found', () => {
    expect(extractPriceFromText('No price here')).toBe(null);
  });

  it('extracts first price from multiple prices', () => {
    expect(extractPriceFromText('Was $99.99, now $79.99')).toBe(99.99);
  });
});
