export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function getStepLabel(step: string): string {
  const labels: Record<string, string> = {
    initializing: 'Initializing',
    opening_browser: 'Opening Browser',
    logging_in: 'Logging In',
    searching: 'Searching Products',
    scraping_results: 'Scraping Results',
    selecting_product: 'Selecting Product',
    adding_to_cart: 'Adding to Cart',
    checkout: 'Processing Checkout',
    filling_shipping: 'Filling Shipping Info',
    confirming_order: 'Confirming Order',
    taking_screenshot: 'Taking Screenshot',
    completed: 'Completed',
    failed: 'Failed',
  };
  return labels[step] ?? step;
}
