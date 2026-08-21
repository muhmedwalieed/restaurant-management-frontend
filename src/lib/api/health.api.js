import { apiHealthClient } from '../api-client.js';

/**
 * Fetch Backend Health Status (GET /api/health)
 */
export const getHealthStatus = async () => {
  return apiHealthClient.get('/health');
};

/**
 * Fetch Backend Readiness Status (GET /api/ready)
 */
export const getReadyStatus = async () => {
  return apiHealthClient.get('/ready');
};
