import { useInternetIdentity } from './useInternetIdentity';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { getSecretParameter } from '../utils/urlParams';

const ACTOR_QUERY_KEY = 'resilient-actor';

export function useResilientActor() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [attemptNonce, setAttemptNonce] = useState(0);
  
  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString(), attemptNonce],
    queryFn: async () => {
      const isAuthenticated = !!identity;

      console.log('[Actor Boot] Starting actor initialization', {
        authenticated: isAuthenticated,
        principal: identity?.getPrincipal().toString() || 'anonymous',
        attempt: attemptNonce,
      });

      if (!isAuthenticated) {
        console.log('[Actor Boot] Creating anonymous actor');
        return await createActorWithConfig();
      }

      const actorOptions = {
        agentOptions: {
          identity
        }
      };

      console.log('[Actor Boot] Creating authenticated actor');
      const actor = await createActorWithConfig(actorOptions);
      
      // Fire-and-forget access control initialization
      // Do NOT block actor availability on this call
      const adminToken = getSecretParameter('caffeineAdminToken') || '';
      
      if (adminToken) {
        console.log('[Actor Boot] Attempting access control initialization (token present)');
        actor._initializeAccessControlWithSecret(adminToken)
          .then(() => {
            console.log('[Actor Boot] Access control initialized successfully');
          })
          .catch((error) => {
            console.warn('[Actor Boot] Access control initialization failed (non-blocking):', error.message);
          });
      } else {
        console.log('[Actor Boot] Skipping access control initialization (no token in URL)');
      }

      console.log('[Actor Boot] Actor ready');
      return actor;
    },
    staleTime: Infinity,
    gcTime: Infinity, // Keep actor in cache
    enabled: true,
    retry: 2, // Retry twice on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
  });

  // When the actor changes, invalidate dependent queries
  useEffect(() => {
    if (actorQuery.data) {
      console.log('[Actor Boot] Actor available, invalidating dependent queries');
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
    }
  }, [actorQuery.data, queryClient]);

  // Force a fresh deployment attempt by incrementing the nonce
  const forceRetry = () => {
    console.log('[Actor Boot] Force retry triggered, incrementing attempt nonce');
    setAttemptNonce(prev => prev + 1);
  };

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
    isError: actorQuery.isError,
    error: actorQuery.error,
    refetch: actorQuery.refetch,
    forceRetry,
    attemptNumber: attemptNonce,
  };
}
