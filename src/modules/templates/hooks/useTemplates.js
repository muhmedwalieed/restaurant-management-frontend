import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTemplatesApi,
  updateTemplatesApi,
  resetTemplatesApi,
} from '../../../lib/api/templates.api.js';

export const useTemplatesQuery = () => {
  return useQuery({
    queryKey: ['restaurant-templates'],
    queryFn: () => getTemplatesApi(),
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

export const useResetTemplatesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => resetTemplatesApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-templates'] });
    },
  });
};
