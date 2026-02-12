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
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

function RootComponent() {
  const { identity, isInitializing: authInitializing } = useInternetIdentity();
  const { actor, isError: actorError, error: actorErrorObj, isFetching: actorFetching, forceRetry: forceActorRetry, attemptNumber } = useResilientActor();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched, isError: profileError, error: profileErrorObj, refetch: refetchProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const prevAttemptRef = useRef(attemptNumber);
  
  const isAuthenticated = !!identity;

  // Boot state machine
  // 1. Auth initializing (loading stored identity)
  // 2. Actor initializing (creating authenticated actor)
  // 3. Profile loading (fetching user profile)
  // 4. Ready (show app or profile setup)
  
  const isActorReady = isAuthenticated && !!actor && !actorFetching;
  const isProfileReady = isActorReady && profileFetched;
  
  // Error classification
  const hasActorError = isAuthenticated && actorError && !actorFetching;
  const hasProfileError = isAuthenticated && isActorReady && profileError && profileFetched;
  const hasBootError = hasActorError || hasProfileError;
  
  // Determine which phase we're in
  const bootPhase = authInitializing 
    ? 'auth-init'
    : !isAuthenticated 
    ? 'logged-out'
    : actorFetching || !actor
    ? 'actor-init'
    : !profileFetched || profileLoading
    ? 'profile-init'
    : 'ready';

  // Extract error details for diagnostics
  const errorType = hasActorError ? 'actor' : hasProfileError ? 'profile' : null;
  const errorMessage = hasActorError 
    ? (actorErrorObj instanceof Error ? actorErrorObj.message : String(actorErrorObj))
    : hasProfileError 
    ? (profileErrorObj instanceof Error ? profileErrorObj.message : String(profileErrorObj))
    : '';

  const principal = identity?.getPrincipal().toString();

  // Monitor deployment attempts and show toast on completion
  useEffect(() => {
    // Skip initial mount
    if (prevAttemptRef.current === attemptNumber) {
      return;
    }

    // An attempt has completed (attempt number changed and not fetching)
    if (!actorFetching && prevAttemptRef.current !== attemptNumber) {
      if (actorError) {
        toast.error('Deployment failed', {
          description: 'Unable to connect to the backend. Please try again.',
        });
      } else if (actor) {
        toast.success('Deployment successful', {
          description: 'Successfully connected to the backend.',
        });
      }
      
      prevAttemptRef.current = attemptNumber;
    }
  }, [attemptNumber, actorFetching, actorError, actor]);

  // Retry handler that triggers a fresh deployment attempt
  const handleRetry = async () => {
    console.log('[App] Retry requested - triggering fresh deployment attempt', { errorType, bootPhase });
    
    // Clear error states from queries
    queryClient.removeQueries({ queryKey: ['resilient-actor'] });
    queryClient.removeQueries({ queryKey: ['currentUserProfile'] });
    
    // Force a fresh actor deployment attempt
    forceActorRetry();
    
    // If we have an actor and profile error, also refetch profile
    if (actor && hasProfileError) {
      console.log('[App] Refetching profile after actor retry...');
      setTimeout(() => {
        refetchProfile();
      }, 500);
    }
  };
  
  // Show boot error screen
  if (hasBootError) {
    console.error('[App] Boot error detected', { 
      errorType, 
      errorMessage, 
      bootPhase,
      hasActor: !!actor,
      principal,
      attemptNumber,
    });
    
    return (
      <>
        <BootErrorScreen 
          errorType={errorType!} 
          errorMessage={errorMessage}
          errorObject={hasActorError ? actorErrorObj : profileErrorObj}
          principal={principal}
          hasActor={!!actor}
          attemptNumber={attemptNumber}
          isRetrying={actorFetching}
          onRetry={handleRetry} 
        />
        <Toaster />
      </>
    );
  }

  // Show loading spinner during boot phases
  if (bootPhase === 'auth-init' || bootPhase === 'actor-init' || bootPhase === 'profile-init') {
    const loadingMessage = bootPhase === 'auth-init' 
      ? 'Initializing...'
      : bootPhase === 'actor-init'
      ? 'Connecting...'
      : 'Loading profile...';
      
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // Show login screen
  if (bootPhase === 'logged-out') {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
        <AppShell showLogin={true} />
      </div>
    );
  }

  // Boot phase is 'ready' - show app
  const showProfileSetup = userProfile === null;

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
