import { Banknote, CreditCard, QrCode, Wallet } from 'lucide-react';
import { PAY_METHODS } from '../../constants.js';

const ICONS = {
  CASH: Banknote,
  CARD: CreditCard,
  INSTAPAY: QrCode,
  WALLET: Wallet,
};

/**
 * The app's payment methods (نقدي، بطاقة، انستاباي، محفظة) with their icons.
 * Order and labels come from `PAY_METHODS` in constants.js, which mirrors the
 * backend `PaymentMethod` enum — every selector must render this list.
 */
export const PAYMENT_METHODS = PAY_METHODS.map((m) => ({
  ...m,
  Icon: ICONS[m.id] || Banknote,
}));

export const payMethodLabel = (id) => PAY_METHODS.find((m) => m.id === id)?.label || id || '—';
