import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRolesApi,
  getRoleByIdApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
  getPermissionsCatalogApi,
} from '../../../lib/api/roles.api.js';

export const useRolesQuery = (params = {}) => {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => getRolesApi(params),
  });
};

export const useRoleQuery = (id) => {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: () => getRoleByIdApi(id),
    enabled: Boolean(id),
  });
};

export const useCreateRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoleApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useUpdateRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateRoleApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useDeleteRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoleApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const usePermissionsCatalogQuery = () => {
  return useQuery({
    queryKey: ['roles', 'permissions-catalog'],
    queryFn: getPermissionsCatalogApi,
  });
};
