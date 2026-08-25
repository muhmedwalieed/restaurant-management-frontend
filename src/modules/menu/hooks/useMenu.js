import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  getProductsApi,
  getProductByIdApi,
  createProductApi,
  updateProductApi,
  getModifiersApi,
  createModifierApi,
  updateModifierApi,
  deleteModifierApi,
  getPublicMenuApi,
} from '../../../lib/api/menu.api.js';

export const useCategoriesQuery = (params = {}) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => getCategoriesApi(params),
  });
};

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-menu'] });
    },
  });
};

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateCategoryApi(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', id] });
      queryClient.invalidateQueries({ queryKey: ['public-menu'] });
    },
  });
};

export const useProductsQuery = (params = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProductsApi(params),
  });
};

export const useProductQuery = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductByIdApi(id),
    enabled: Boolean(id),
  });
};

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProductApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-menu'] });
    },
  });
};

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateProductApi(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-menu'] });
    },
  });
};

export const useModifiersQuery = (productId) => {
  return useQuery({
    queryKey: ['modifiers', productId],
    queryFn: () => getModifiersApi(productId),
    enabled: Boolean(productId),
  });
};

export const useCreateModifierMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, payload }) => createModifierApi(productId, payload),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['modifiers', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['public-menu'] });
    },
  });
};

export const useUpdateModifierMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, modifierId, payload }) =>
      updateModifierApi(productId, modifierId, payload),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['modifiers', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['public-menu'] });
    },
  });
};

export const useDeleteModifierMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, modifierId }) => deleteModifierApi(productId, modifierId),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['modifiers', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['public-menu'] });
    },
  });
};

export const usePublicMenuQuery = (params = {}) => {
  return useQuery({
    queryKey: ['public-menu', params],
    queryFn: () => getPublicMenuApi(params),
    enabled: Boolean(params.slug || params.restaurantId),
  });
};
