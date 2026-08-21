import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './providers.jsx';
import { router } from './router.jsx';

export const App = () => {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
};
