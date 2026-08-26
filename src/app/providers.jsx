import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../modules/auth/context/AuthContext.jsx';
import { BranchProvider } from '../modules/auth/context/BranchContext.jsx';
import { ErrorBoundary } from '../shared/components/ErrorBoundary.jsx';
import { SocketProvider } from '../shared/realtime/SocketProvider.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error?.status && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 1000 * 60 * 3,
    },
    mutations: {
      retry: (failureCount, error) => {
        if (error?.isConnectionIssue && failureCount < 2) {
          return true;
        }
        return false;
      },
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
