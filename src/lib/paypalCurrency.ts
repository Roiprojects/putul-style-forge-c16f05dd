// PayPal supported currencies. If user's currency isn't supported, fall back to USD.
export const PAYPAL_SUPPORTED = new Set([
  "USD", "EUR", "GBP", "CHF", "AUD", "CAD", "JPY", "SGD", "HKD",
  "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "NZD", "MXN", "BRL",
  "TWD", "THB", "PHP", "MYR", "ILS",
]);

export const getPayPalCurrency = (code: string): string => {
  return PAYPAL_SUPPORTED.has(code) ? code : "USD";
};
