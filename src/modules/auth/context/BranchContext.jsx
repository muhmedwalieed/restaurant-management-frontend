/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

const MOCK_BRANCHES = [
  { id: 'br-1', name: 'فرع مدينة نصر (الفرع الرئيسي)', code: 'MN-01', isActive: true },
  { id: 'br-2', name: 'فرع التجمع الخامس', code: 'TJ-02', isActive: true },
  { id: 'br-3', name: 'فرع المعادي', code: 'MD-03', isActive: true },
];

const BranchContext = createContext(null);

export const BranchProvider = ({ children }) => {
  const [branches] = useState(MOCK_BRANCHES);
  const [activeBranch, setActiveBranch] = useState(MOCK_BRANCHES[0]);

  return (
    <BranchContext.Provider
      value={{
        branches,
        activeBranch,
        setActiveBranch,
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
