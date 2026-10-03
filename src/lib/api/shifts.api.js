import { apiClient } from '../api-client.js';

export const getCurrentShiftApi = async (branchId) => {
  return apiClient.get(`/branches/${branchId}/shifts/current`);
};

export const openShiftApi = async (branchId, payload) => {
  return apiClient.post(`/branches/${branchId}/shifts/open`, payload);
};

export const getXReportApi = async (branchId, shiftId) => {
  return apiClient.get(`/branches/${branchId}/shifts/${shiftId}/x-report`);
};

export const closeShiftApi = async (branchId, shiftId, payload) => {
  return apiClient.post(`/branches/${branchId}/shifts/${shiftId}/close`, payload);
};

export const addCashMovementApi = async (branchId, shiftId, payload) => {
  return apiClient.post(`/branches/${branchId}/shifts/${shiftId}/cash-movement`, payload);
};

export const getShiftDetailsApi = async (branchId, shiftId) => {
  return apiClient.get(`/branches/${branchId}/shifts/${shiftId}`);
};

export const listShiftsApi = async (branchId, params = {}) => {
  return apiClient.get(`/branches/${branchId}/shifts`, { params });
};
