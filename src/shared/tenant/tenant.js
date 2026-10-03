/**
 * Every restaurant has its own staff host: `prime-restaurant.example.com`.
 * The restaurant is identified by the host's first label — the URL path never
 * carries it, so the router and every navigation path stay tenant-free.
 *
 * `localhost` / `127.0.0.1` / a bare registered domain have no tenant: only the
 * public customer pages (`/menu/table/:token`, `/order/:slug`) are served there.
 */

const RESERVED_LABELS = new Set(['www', 'api', 'app', 'admin', 'static', 'cdn']);

export const parseRestaurantSlug = (hostname) => {
  if (!hostname) return null;

  let host = String(hostname).toLowerCase().trim().replace(/\.$/, '');
  if (host.startsWith('[')) return null; // IPv6 literal — never a tenant
  host = host.split(':')[0]; // drop any port

  if (!host || host === 'localhost' || host === '127.0.0.1' || host === '::1') {
    return null;
  }

  const labels = host.split('.');
  const first = labels[0];
  if (!first || RESERVED_LABELS.has(first)) return null;

  // Bare registered domain (example.com) has no subdomain to read a tenant from.
  // Anything under `*.localhost` is dev and only needs two labels.
  const isLocalhost = labels[labels.length - 1] === 'localhost';
  if (!isLocalhost && labels.length < 3) return null;

  return /^[a-z0-9-]+$/.test(first) ? first : null;
};

const hostname = typeof window !== 'undefined' ? window.location.hostname : null;

/** The restaurant this page is served for, or null on a host without a tenant. */
export const restaurantSlug = parseRestaurantSlug(hostname);

export const hasRestaurantHost = Boolean(restaurantSlug);

export const getRestaurantSlug = () => restaurantSlug;
