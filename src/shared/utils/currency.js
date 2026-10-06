/**
 * Currency utility functions.
 */

/**
 * Format numeric value with raw currency symbol/code as provided by backend.
 * @param {number|string} amount
 * @param {string} [currency='']
 * @param {object} [options]
 * @returns {string}
 */
export const formatCurrency = (amount, currency = '', options = {}) => {
  const num = Number(amount) || 0;
  const decimals = options.decimals !== undefined ? options.decimals : 2;
  const formattedNumber = options.useLocale
    ? num.toLocaleString('ar-EG', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : num.toFixed(decimals);

  return currency ? `${formattedNumber} ${currency}` : `${formattedNumber}`;
};
