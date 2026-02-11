export const AMAZON_SELECTORS = {
  LOGIN: {
    EMAIL_INPUT: '#ap_email',
    PASSWORD_INPUT: '#ap_password',
    CONTINUE_BUTTON: '#continue',
    SIGN_IN_BUTTON: '#signInSubmit',
    CAPTCHA_IMAGE: '#auth-captcha-image',
    ERROR_MESSAGE: '#auth-error-message-box',
    ACCOUNT_LIST: '#nav-link-accountList-nav-line-1',
  },

  SEARCH: {
    SEARCH_INPUT: '#twotabsearchtextbox',
    SEARCH_BUTTON: '#nav-search-submit-button',
    RESULTS_CONTAINER: '.s-main-slot',
    RESULT_ITEM: '[data-component-type="s-search-result"]',
    NO_RESULTS: '.s-no-results-icon',
  },

  PRODUCT: {
    TITLE: 'h2 a span',
    PRICE_WHOLE: '.a-price-whole',
    PRICE_FRACTION: '.a-price-fraction',
    PRICE_SYMBOL: '.a-price-symbol',
    IMAGE: '.s-image',
    LINK: 'h2 a',
    RATING: '.a-icon-star-small span',
    REVIEW_COUNT: '[data-csa-c-slot-id="alf-reviews"]',
    PRIME_BADGE: '.s-prime',
    ASIN: '[data-asin]',
  },

  PRODUCT_PAGE: {
    TITLE: '#productTitle',
    PRICE: '#priceblock_ourprice, #priceblock_dealprice, .a-price .a-offscreen',
    ADD_TO_CART_BUTTON: '#add-to-cart-button',
    BUY_NOW_BUTTON: '#buy-now-button',
    QUANTITY_SELECT: '#quantity',
    IN_STOCK: '#availability span',
  },

  CART: {
    CART_ICON: '#nav-cart',
    CART_COUNT: '#nav-cart-count',
    CART_ITEMS: '.sc-list-item',
    PROCEED_TO_CHECKOUT: 'input[name="proceedToRetailCheckout"]',
    CART_SUBTOTAL: '#sc-subtotal-amount-activecart',
    DELETE_BUTTON: 'input[data-action="delete"]',
  },

  CHECKOUT: {
    PLACE_ORDER_BUTTON: '#submitOrderButtonId input, #placeYourOrder input',
    SHIPPING_ADDRESS_CONTAINER: '#address-book-entry-0',
    ADD_NEW_ADDRESS: '#add-new-address-popover-link',
    FULL_NAME: 'input[name="address-ui-widgets-enterAddressFullName"]',
    ADDRESS_LINE_1: 'input[name="address-ui-widgets-enterAddressLine1"]',
    ADDRESS_LINE_2: 'input[name="address-ui-widgets-enterAddressLine2"]',
    CITY: 'input[name="address-ui-widgets-enterAddressCity"]',
    STATE: 'input[name="address-ui-widgets-enterAddressStateOrRegion"]',
    ZIP_CODE: 'input[name="address-ui-widgets-enterAddressPostalCode"]',
    PHONE: 'input[name="address-ui-widgets-enterAddressPhoneNumber"]',
    USE_THIS_ADDRESS: 'input[aria-labelledby*="address-book-entry"]',
    CONTINUE_BUTTON: '.a-button-input[type="submit"]',
    ORDER_TOTAL: '.grand-total-price',
    CONFIRMATION_MESSAGE: '#widget-purchaseConfirmationStatus',
  },

  COMMON: {
    LOADING_SPINNER: '.a-spinner',
    MODAL_CLOSE: '.a-modal-close',
    ERROR_ALERT: '.a-alert-error',
  },
} as const;

export type AmazonSelector = typeof AMAZON_SELECTORS;
