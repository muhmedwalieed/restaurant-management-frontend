import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEmployeesApi,
  getEmployeeByIdApi,
  createEmployeeApi,
  updateEmployeeApi,
  changeEmployeePasswordApi,
  changeEmployeeRoleApi,
  forceLogoutEmployeeApi,
  deleteEmployeeApi,
} from '../../../lib/api/employees.api.js';

export const useEmployeesQuery = (params = {}) => {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => getEmployeesApi(params),
  });
};

export const useEmployeeQuery = (id) => {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => getEmployeeByIdApi(id),
    enabled: Boolean(id),
  });
};

export const useCreateEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployeeApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useUpdateEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateEmployeeApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: ({ id, payload }) => changeEmployeePasswordApi(id, payload),
  });
};

export const useChangeRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => changeEmployeeRoleApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployeeApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useForceLogoutEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: forceLogoutEmployeeApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};
