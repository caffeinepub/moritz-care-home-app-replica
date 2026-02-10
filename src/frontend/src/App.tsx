import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import ResidentDashboardPage from './pages/ResidentDashboardPage';
import ResidentProfilePage from './pages/ResidentProfilePage';
import AppShell from './components/layout/AppShell';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import { Toaster } from '@/components/ui/sonner';

function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing || (isAuthenticated && !isFetched)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
        <AppShell showLogin={true} />
      </div>
    );
  }

  return (
    <>
      <AppShell>
        <Outlet />
      </AppShell>
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster />
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ResidentDashboardPage,
});

const residentProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/resident/$residentId',
  component: ResidentProfilePage,
});

const routeTree = rootRoute.addChildren([indexRoute, residentProfileRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
