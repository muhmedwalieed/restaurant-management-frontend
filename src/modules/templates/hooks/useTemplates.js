import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTemplatesApi,
  updateTemplatesApi,
  resetTemplatesApi,
  createTemplateApi,
  deleteTemplateApi,
} from '../../../lib/api/templates.api.js';

export const useTemplatesQuery = (options = {}) => {
  return useQuery({
    queryKey: ['restaurant-templates'],
    queryFn: () => getTemplatesApi(),
    ...options,
  });
};

export const useUpdateTemplatesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => updateTemplatesApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-templates'] });
    },
  });
};

export const useCreateTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createTemplateApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-templates'] });
    },
  });
};

export const useDeleteTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key) => deleteTemplateApi(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-templates'] });
    },
  });
};

export const useResetTemplatesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => resetTemplatesApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-templates'] });
    },
  });
};

