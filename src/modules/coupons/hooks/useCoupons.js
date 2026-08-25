import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCouponsApi,
  createCouponApi,
  updateCouponApi,
  deleteCouponApi,
} from '../../../lib/api/coupons.api.js';

export const useCouponsQuery = (params = {}) => {
  return useQuery({
    queryKey: ['coupons', params],
    queryFn: () => getCouponsApi(params),
  });
};

export const useCreateCouponMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createCouponApi(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons'] }),
  });
};

export const useUpdateCouponMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateCouponApi(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['coupons'] });
      qc.invalidateQueries({ queryKey: ['coupon', id] });
    },
  });
};

export const useDeleteCouponMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteCouponApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons'] }),
  });
};
