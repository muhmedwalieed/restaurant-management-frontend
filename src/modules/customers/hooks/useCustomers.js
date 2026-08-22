import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCustomersApi,
  getCustomerByIdApi,
  createCustomerApi,
  updateCustomerApi,
  deleteCustomerApi,
  getCustomerOrdersApi,
  getCustomerAddressesApi,
  createAddressApi,
  updateAddressApi,
  deleteAddressApi,
} from '../../../lib/api/customers.api.js';

export const useCustomersQuery = (params = {}) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => getCustomersApi(params),
  });
};

export const useCustomerQuery = (id) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomerByIdApi(id),
    enabled: Boolean(id),
  });
};

export const useCustomerOrdersQuery = (id, params = {}) => {
  return useQuery({
    queryKey: ['customer-orders', id, params],
    queryFn: () => getCustomerOrdersApi(id, params),
    enabled: Boolean(id),
  });
};

export const useCustomerAddressesQuery = (id) => {
  return useQuery({
    queryKey: ['customer-addresses', id],
    queryFn: () => getCustomerAddressesApi(id),
    enabled: Boolean(id),
  });
};

export const useCreateCustomerMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createCustomerApi(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
};

export const useUpdateCustomerMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateCustomerApi(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      qc.invalidateQueries({ queryKey: ['customer', id] });
    },
  });
};

export const useDeleteCustomerMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteCustomerApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
};

export const useCreateAddressMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, payload }) => createAddressApi(customerId, payload),
    onSuccess: (_, { customerId }) => {
      qc.invalidateQueries({ queryKey: ['customer-addresses', customerId] });
      qc.invalidateQueries({ queryKey: ['customer', customerId] });
    },
  });
};

export const useUpdateAddressMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, addressId, payload }) => updateAddressApi(customerId, addressId, payload),
    onSuccess: (_, { customerId }) => {
      qc.invalidateQueries({ queryKey: ['customer-addresses', customerId] });
      qc.invalidateQueries({ queryKey: ['customer', customerId] });
    },
  });
};

export const useDeleteAddressMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, addressId }) => deleteAddressApi(customerId, addressId),
    onSuccess: (_, { customerId }) => {
      qc.invalidateQueries({ queryKey: ['customer-addresses', customerId] });
      qc.invalidateQueries({ queryKey: ['customer', customerId] });
    },
  });
};