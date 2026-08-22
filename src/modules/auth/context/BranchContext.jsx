/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBranchesApi } from '../../../lib/api/branches.api.js';
import { useAuth } from './AuthContext.jsx';

const BranchContext = createContext(null);

export const BranchProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [activeBranchId, setActiveBranchIdState] = useState(() => {
    return localStorage.getItem('saas_active_branch_id') || null;
  });

  // Query Active Branches from Backend API — only when authenticated.
  // Without this gate the provider (mounted above the router) would fire
  // GET /branches on every page — including /login — causing 401 console spam.
  const {
    data: branchesResponse,
    isLoading,
    refetch: refetchBranches,
  } = useQuery({
    queryKey: ['branches', { status: 'ACTIVE' }],
    queryFn: () => getBranchesApi({ status: 'ACTIVE' }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: isAuthenticated,
  });

  // Clear the selected branch whenever the user logs out / session ends
  useEffect(() => {
    if (!isAuthenticated) {
      setActiveBranchIdState(null);
      localStorage.removeItem('saas_active_branch_id');
    }
  }, [isAuthenticated]);

  const branches = useMemo(() => {
    return branchesResponse?.items || (Array.isArray(branchesResponse) ? branchesResponse : []);
  }, [branchesResponse]);

  // Auto select active branch if none selected or selected branch no longer exists
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
