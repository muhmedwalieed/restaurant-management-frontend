const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const API_ORIGIN = new URL(API_BASE_URL).origin;

export const resolveAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('/uploads/')) return `${API_ORIGIN}${path}`;
  return path;
};

export default resolveAssetUrl;
