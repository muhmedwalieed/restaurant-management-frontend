const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const API_ORIGIN = new URL(API_BASE_URL).origin;

/**
 * Resolves an asset reference to a displayable URL.
 * Server-uploaded images are stored as relative paths (/uploads/...) and are
 * served from the backend origin. External URLs are returned unchanged.
 */
export const resolveAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('/uploads/')) return `${API_ORIGIN}${path}`;
  return path;
};

export default resolveAssetUrl;