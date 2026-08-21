import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRestaurantProfileApi,
  updateRestaurantProfileApi,
  updateRestaurantStatusApi,
} from '../../../lib/api/restaurant.api.js';

export const useRestaurantQuery = () => {
  return useQuery({
    queryKey: ['restaurant-profile'],
    queryFn: getRestaurantProfileApi,
  });
};

export const useUpdateRestaurantMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRestaurantProfileApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-profile'] });
    },
  });
};

export const useUpdateRestaurantStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRestaurantStatusApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-profile'] });
    },
  });
};
