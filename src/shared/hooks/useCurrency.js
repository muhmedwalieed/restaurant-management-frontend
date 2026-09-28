import { useBranch } from '../../modules/auth/context/BranchContext.jsx';
import { formatCurrency } from '../utils/currency.js';

/**
 * Hook providing active branch currency and pre-bound formatting helper.
 */
export const useCurrency = () => {
  const { activeBranch } = useBranch();
  const currency = activeBranch?.settings?.currency || 'ج.م';

  const format = (amount, options) => formatCurrency(amount, currency, options);

  return {
    currency,
    formatCurrency: format,
  };
};
