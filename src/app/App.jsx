import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './providers.jsx';
import { router } from './router.jsx';
import { NetworkStatusBanner } from '../shared/components/NetworkStatusBanner.jsx';

export const App = () => {
  return (
    <AppProviders>
      <NetworkStatusBanner />
      <RouterProvider router={router} />
    </AppProviders>
  );
};
