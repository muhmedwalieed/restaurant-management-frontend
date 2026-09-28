/**
 * Currency utility functions.
 */

/**
 * Format numeric value with currency symbol/code.
 * @param {number|string} amount
 * @param {string} [currency='ج.م']
 * @param {object} [options]
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'ج.م', options = {}) => {
  const num = Number(amount) || 0;
  const decimals = options.decimals !== undefined ? options.decimals : 2;
  const formattedNumber = options.useLocale
    ? num.toLocaleString('ar-EG', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : num.toFixed(decimals);

  return `${formattedNumber} ${currency}`;
};
