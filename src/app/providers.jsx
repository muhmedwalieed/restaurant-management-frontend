import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../modules/auth/context/AuthContext.jsx';
import { BranchProvider } from '../modules/auth/context/BranchContext.jsx';
import { ErrorBoundary } from '../shared/components/ErrorBoundary.jsx';
import { SocketProvider } from '../shared/realtime/SocketProvider.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export const AppProviders = ({ children }) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BranchProvider>
            <SocketProvider>{children}</SocketProvider>
          </BranchProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
