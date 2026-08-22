import { useMutation } from '@tanstack/react-query';
import { lookupCallerApi, createPhoneOrderApi } from '../../../lib/api/phone-order.api.js';

export const useLookupCallerMutation = () => {
  return useMutation({ mutationFn: (phone) => lookupCallerApi(phone) });
};

export const useCreatePhoneOrderMutation = () => {
  return useMutation({ mutationFn: ({ branchId, payload }) => createPhoneOrderApi(branchId, payload) });
};