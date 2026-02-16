import { StrictMode, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useResilientActor } from './hooks/useResilientActor';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import BootErrorScreen from './components/auth/BootErrorScreen';
import AppShell from './components/layout/AppShell';
import ResidentDashboardPage from './pages/ResidentDashboardPage';
import ResidentProfilePage from './pages/ResidentProfilePage';
import SettingsPage from './pages/SettingsPage';
import ResponsiblePersonAddPage from './pages/resident-profile/responsible-persons/ResponsiblePersonAddPage';
import ResponsiblePersonEditPage from './pages/resident-profile/responsible-persons/ResponsiblePersonEditPage';
import PharmacyAddPage from './pages/resident-profile/pharmacy/PharmacyAddPage';
import PharmacyEditPage from './pages/resident-profile/pharmacy/PharmacyEditPage';
import InsuranceAddPage from './pages/resident-profile/insurance/InsuranceAddPage';
import InsuranceEditPage from './pages/resident-profile/insurance/InsuranceEditPage';
import PhysicianAddPage from './pages/resident-profile/physicians/PhysicianAddPage';
import PhysicianEditPage from './pages/resident-profile/physicians/PhysicianEditPage';
import { toast } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
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

const residentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/resident/$residentId',
  component: ResidentProfilePage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const responsiblePersonAddRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/resident/$residentId/responsible-persons/add',
  component: ResponsiblePersonAddPage,
});

const responsiblePersonEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/resident/$residentId/responsible-persons/$contactId/edit',
  component: ResponsiblePersonEditPage,
});

const pharmacyAddRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/resident/$residentId/pharmacy/add',
  component: PharmacyAddPage,
});

const pharmacyEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/resident/$residentId/pharmacy/$pharmacyId/edit',
  component: PharmacyEditPage,
});

const insuranceAddRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/resident/$residentId/insurance/add',
  component: InsuranceAddPage,
});

const insuranceEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/resident/$residentId/insurance/$insuranceId/edit',
  component: InsuranceEditPage,
});

const physicianAddRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/resident/$residentId/physicians/add',
  component: PhysicianAddPage,
});

const physicianEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/resident/$residentId/physicians/$physicianId/edit',
  component: PhysicianEditPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  residentRoute,
  settingsRoute,
  responsiblePersonAddRoute,
  responsiblePersonEditRoute,
  pharmacyAddRoute,
  pharmacyEditRoute,
  insuranceAddRoute,
  insuranceEditRoute,
  physicianAddRoute,
  physicianEditRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

type BootState = 'initializing' | 'ready' | 'error' | 'retrying';

function AppContent() {
  const [bootState, setBootState] = useState<BootState>('initializing');
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [attemptNumber, setAttemptNumber] = useState(1);

  const { actor, error: actorError, isFetching: actorLoading, forceRetry } = useResilientActor();
  const { identity, isInitializing: identityInitializing } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  useEffect(() => {
    if (actorError) {
      console.error('[Boot] Actor error detected:', actorError);
      setErrorDetails(actorError);
      setBootState('error');
      toast.error('Deployment attempt failed', {
        description: `Attempt ${attemptNumber} - Check diagnostics for details`,
        duration: 5000,
      });
      return;
    }

    if (actorLoading || identityInitializing) {
      if (bootState !== 'retrying') {
        setBootState('initializing');
      }
      return;
    }

    if (actor) {
      console.log('[Boot] Actor ready, transitioning to ready state');
      setBootState('ready');
      if (attemptNumber > 1) {
        toast.success('Connection established', {
          description: `Successfully connected on attempt ${attemptNumber}`,
        });
      }
    }
  }, [actor, actorError, actorLoading, identityInitializing, bootState, attemptNumber]);

  const handleRetry = async () => {
    console.log('[Boot] User triggered retry');
    setAttemptNumber((prev) => prev + 1);
    setBootState('retrying');
    setErrorDetails(null);
    forceRetry();
  };

  if (bootState === 'error') {
    return (
      <BootErrorScreen
        errorType="actor"
        errorMessage={actorError?.message || 'Unknown error'}
        errorObject={errorDetails}
        principal={identity?.getPrincipal().toString()}
        hasActor={!!actor}
        attemptNumber={attemptNumber}
        isRetrying={false}
        onRetry={handleRetry}
      />
    );
  }

  if (bootState === 'initializing' || bootState === 'retrying') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            {bootState === 'retrying' ? `Retrying connection (attempt ${attemptNumber})...` : 'Initializing application...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      {showProfileSetup && <ProfileSetupModal />}
    </>
  );
}

export default function App() {
  return (
    <StrictMode>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <AppContent />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  );
}
