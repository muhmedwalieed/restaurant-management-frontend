
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyBranchesApi } from '../../../lib/api/multi-branch.api.js';
import { useAuth } from './AuthContext.jsx';

const BranchContext = createContext(null);

export const BranchProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [activeBranchId, setActiveBranchIdState] = useState(() => {
    return localStorage.getItem('saas_active_branch_id') || null;
  });

  const {
    data: branchesResponse,
    isLoading,
    refetch: refetchBranches,
  } = useQuery({
    queryKey: ['my-branches'],
    queryFn: () => getMyBranchesApi(),
    staleTime: 1000 * 5,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setActiveBranchIdState(null);
      localStorage.removeItem('saas_active_branch_id');
    }
  }, [isAuthenticated]);

  const branches = useMemo(() => {
    if (!branchesResponse) return [];
    if (Array.isArray(branchesResponse)) return branchesResponse;
    if (Array.isArray(branchesResponse?.items)) return branchesResponse.items;
    if (Array.isArray(branchesResponse?.data)) return branchesResponse.data;
    return [];
  }, [branchesResponse]);

  useEffect(() => {
    if (branches.length > 0) {
      const exists = branches.some((b) => b.id === activeBranchId);
      if (!activeBranchId || !exists) {
        const defaultBranch = branches.find((b) => b.isMain) || branches[0];
        setActiveBranchIdState(defaultBranch.id);
        localStorage.setItem('saas_active_branch_id', defaultBranch.id);
      }
    }
  }, [branches, activeBranchId]);

  const setActiveBranch = (branchOrId) => {
    const id = typeof branchOrId === 'object' ? branchOrId.id : branchOrId;
    setActiveBranchIdState(id);
    if (id) {
      localStorage.setItem('saas_active_branch_id', id);
    } else {
      localStorage.removeItem('saas_active_branch_id');
    }
  };

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0] || null;

  return (
    <BranchContext.Provider
      value={{
        branches,
        activeBranch,
        activeBranchId: activeBranch?.id || null,
        setActiveBranch,
        isLoading,
        refetchBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const ctx = useContext(BranchContext);
  if (!ctx) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return ctx;
};
