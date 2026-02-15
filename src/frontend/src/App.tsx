import { StrictMode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { Toaster, toast } from 'sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useResilientActor } from './hooks/useResilientActor';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import AppShell from './components/layout/AppShell';
import ResidentDashboardPage from './pages/ResidentDashboardPage';
import ResidentProfilePage from './pages/ResidentProfilePage';
import SettingsPage from './pages/SettingsPage';
import BootErrorScreen from './components/auth/BootErrorScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

const rootRoute = createRootRoute({
  component: AppShell,
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

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([indexRoute, residentProfileRoute, settingsRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

type BootState = 'initializing' | 'ready' | 'error';

function AppContent() {
  const { identity, isInitializing: authInitializing } = useInternetIdentity();
  const { actor, error: actorError, isFetching: actorLoading, forceRetry, attemptNumber } = useResilientActor();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const [bootState, setBootState] = useState<BootState>('initializing');
  const [lastAttempt, setLastAttempt] = useState(0);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (authInitializing || actorLoading) {
      setBootState('initializing');
      return;
    }

    if (actorError) {
      setBootState('error');
      return;
    }

    if (actor) {
      setBootState('ready');
      if (attemptNumber > lastAttempt && lastAttempt > 0) {
        toast.success('Successfully connected to backend', {
          description: `Deployment attempt ${attemptNumber} succeeded`,
        });
      }
      setLastAttempt(attemptNumber);
    }
  }, [authInitializing, actorLoading, actorError, actor, attemptNumber, lastAttempt]);

  useEffect(() => {
    if (actorError && attemptNumber > lastAttempt) {
      toast.error('Backend connection failed', {
        description: `Deployment attempt ${attemptNumber} failed. Retrying...`,
      });
      setLastAttempt(attemptNumber);
    }
  }, [actorError, attemptNumber, lastAttempt]);

  if (bootState === 'initializing') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Initializing application...</p>
        </div>
      </div>
    );
  }

  if (bootState === 'error') {
    const handleRetry = async () => {
      forceRetry();
    };

    return (
      <BootErrorScreen
        errorType="actor"
        errorMessage={actorError?.message || 'Unknown error'}
        errorObject={actorError}
        principal={identity?.getPrincipal().toString()}
        hasActor={!!actor}
        attemptNumber={attemptNumber}
        isRetrying={actorLoading}
        onRetry={handleRetry}
      />
    );
  }

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      {showProfileSetup && <ProfileSetupModal />}
      <RouterProvider router={router} />
    </>
  );
}

export default function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <Toaster position="top-right" />
      </QueryClientProvider>
    </StrictMode>
  );
}
