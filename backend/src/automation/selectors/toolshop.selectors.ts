export const TOOLSHOP_SELECTORS = {
  LOGIN: {
    FORM: '[data-test="login-form"]',
    EMAIL_INPUT: '[data-test="email"]',
    PASSWORD_INPUT: '#password',
    SUBMIT_BUTTON: '[data-test="login-submit"]',
    ERROR_MESSAGE: '[data-test="login-error"]',
  },

  NAV: {
    HOME: '[data-test="nav-home"]',
    CATEGORIES: '[data-test="nav-categories"]',
    CART: '[data-test="nav-cart"]',
    CART_QUANTITY: '[data-test="cart-quantity"]',
    SIGN_IN: '[data-test="nav-sign-in"]',
    SIGN_OUT: '[data-test="nav-sign-out"]',
    MENU: '[data-test="nav-menu"]',
  },

  SEARCH: {
    QUERY_INPUT: '[data-test="search-query"]',
    SUBMIT_BUTTON: '[data-test="search-submit"]',
    RESET_BUTTON: '[data-test="search-reset"]',
    SORT_SELECT: '[data-test="sort"]',
    NO_RESULTS: '[data-test="no-results"]',
  },

  PRODUCT_CARD: {
    CONTAINER: '.col-md-9 a.card',
    NAME: '[data-test="product-name"]',
    PRICE: '[data-test="product-price"]',
    OUT_OF_STOCK: '[data-test="out-of-stock"]',
  },

  PRODUCT_DETAIL: {
    NAME: '[data-test="product-name"]',
    PRICE: '[data-test="unit-price"]',
    DESCRIPTION: '[data-test="product-description"]',
    QUANTITY_INPUT: '[data-test="quantity"]',
    INCREASE_QUANTITY: '[data-test="increase-quantity"]',
    DECREASE_QUANTITY: '[data-test="decrease-quantity"]',
    ADD_TO_CART: '[data-test="add-to-cart"]',
    OUT_OF_STOCK: '[data-test="out-of-stock"]',
  },

  CART: {
    PRODUCT_TITLE: '[data-test="product-title"]',
    PRODUCT_QUANTITY: '[data-test="product-quantity"]',
    PRODUCT_PRICE: '[data-test="product-price"]',
    LINE_PRICE: '[data-test="line-price"]',
    CART_TOTAL: '[data-test="cart-total"]',
    CONTINUE_SHOPPING: '[data-test="continue-shopping"]',
    PROCEED_BUTTON: '[data-test="proceed-1"]',
  },

  CHECKOUT: {
    PROCEED_AFTER_LOGIN: '[data-test="proceed-2"]',
    STREET: '[data-test="street"]',
    CITY: '[data-test="city"]',
    STATE: '[data-test="state"]',
    COUNTRY: '[data-test="country"]',
    POSTAL_CODE: '[data-test="postal_code"]',
    PROCEED_TO_PAYMENT: '[data-test="proceed-3"]',
    PAYMENT_METHOD: '[data-test="payment-method"]',
    BANK_NAME: '[data-test="bank_name"]',
    ACCOUNT_NAME: '[data-test="account_name"]',
    ACCOUNT_NUMBER: '[data-test="account_number"]',
    CREDIT_CARD_NUMBER: '[data-test="credit_card_number"]',
    EXPIRATION_DATE: '[data-test="expiration_date"]',
    CVV: '[data-test="cvv"]',
    CARD_HOLDER_NAME: '[data-test="card_holder_name"]',
    CONFIRM_BUTTON: '[data-test="finish"]',
    PAYMENT_SUCCESS: '[data-test="payment-success-message"]',
    PAYMENT_ERROR: '[data-test="payment-error-message"]',
  },

  PAGINATION: {
    NEXT: '[aria-label="Next"]',
    PREVIOUS: '[aria-label="Previous"]',
    PAGE: (pageNumber: number): string => `[aria-label="Page-${pageNumber}"]`,
  },
} as const;

export type ToolshopSelector = typeof TOOLSHOP_SELECTORS;
