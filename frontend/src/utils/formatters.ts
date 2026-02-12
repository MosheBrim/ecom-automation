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

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
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
    filling_payment: 'Filling Payment Info',
    confirming_order: 'Confirming Order',
    taking_screenshot: 'Taking Screenshot',
    completed: 'Completed',
    failed: 'Failed',
  };
  return labels[step] ?? step;
}

export function getStepIcon(step: string): string {
  const icons: Record<string, string> = {
    initializing: '1',
    opening_browser: '2',
    logging_in: '3',
    adding_to_cart: '4',
    checkout: '5',
    filling_shipping: '6',
    filling_payment: '7',
    confirming_order: '8',
    taking_screenshot: '9',
  };
  return icons[step] ?? '?';
}
