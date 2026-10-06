import { useBranch } from '../../modules/auth/context/BranchContext.jsx';
import { useAuth } from '../../modules/auth/context/AuthContext.jsx';
import { formatCurrency } from '../utils/currency.js';

/**
 * Hook providing active branch currency directly from backend branch/restaurant settings.
 */
export const useCurrency = () => {
  const { activeBranch } = useBranch();
  const { user } = useAuth();
  const currency =
    activeBranch?.settings?.currency ||
    activeBranch?.currency ||
    user?.restaurant?.settings?.currency ||
    user?.restaurant?.currency ||
    '';

  const format = (amount, options) => formatCurrency(amount, currency, options);

  return {
    currency,
    formatCurrency: format,
  };
};
