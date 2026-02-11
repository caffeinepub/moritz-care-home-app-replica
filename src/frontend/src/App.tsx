import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useResilientActor } from './hooks/useResilientActor';
import { useQueryClient } from '@tanstack/react-query';
import ResidentDashboardPage from './pages/ResidentDashboardPage';
import ResidentProfilePage from './pages/ResidentProfilePage';
import AppShell from './components/layout/AppShell';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import BootErrorScreen from './components/auth/BootErrorScreen';
import { Toaster } from '@/components/ui/sonner';

function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isError: actorError, error: actorErrorObj, refetch: refetchActor } = useResilientActor();
  const { data: userProfile, isLoading: profileLoading, isFetched, isError: profileError, error: profileErrorObj, refetch: refetchProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  
  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Determine boot error type and details
  const hasActorError = isAuthenticated && actorError;
  const hasProfileError = isAuthenticated && profileError && isFetched;
  const hasBootError = hasActorError || hasProfileError;
  
  // Extract error messages
  const errorType = hasActorError ? 'actor' : hasProfileError ? 'profile' : null;
  const errorMessage = hasActorError 
    ? (actorErrorObj instanceof Error ? actorErrorObj.message : String(actorErrorObj))
    : hasProfileError 
    ? (profileErrorObj instanceof Error ? profileErrorObj.message : String(profileErrorObj))
    : '';

  // Retry handler that resets queries without clearing identity
  const handleRetry = async () => {
    console.log('[App] Retry requested - resetting boot queries');
    
    // Remove error states from queries
    queryClient.removeQueries({ queryKey: ['resilient-actor'] });
    queryClient.removeQueries({ queryKey: ['currentUserProfile'] });
    
    // Refetch actor and profile
    if (hasActorError) {
      await refetchActor();
    }
    if (hasProfileError) {
      await refetchProfile();
    }
  };
  
  if (hasBootError) {
    console.error('[App] Boot error detected - showing error screen', { errorType, errorMessage });
    return <BootErrorScreen errorType={errorType!} errorMessage={errorMessage} onRetry={handleRetry} />;
  }

  // Show loading spinner during initialization
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
