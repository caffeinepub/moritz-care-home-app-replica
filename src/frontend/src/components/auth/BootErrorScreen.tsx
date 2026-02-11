import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface BootErrorScreenProps {
  errorType: 'actor' | 'profile';
  errorMessage: string;
  onRetry: () => Promise<void>;
}

export default function BootErrorScreen({ errorType, errorMessage, onRetry }: BootErrorScreenProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const primaryMessage = errorType === 'actor' 
    ? 'Actor initialization failed'
    : 'Profile fetch failed';

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Unable to Initialize
          </h1>
          
          <p className="text-gray-600 mb-2">
            {primaryMessage}. This may be due to a temporary connection issue or configuration problem.
          </p>

          <Collapsible open={showDetails} onOpenChange={setShowDetails} className="mb-6">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-sm text-gray-500 hover:text-gray-700">
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-gray-50 rounded-md p-3 text-left">
                <p className="text-xs font-mono text-gray-700 break-words">
                  {errorMessage || 'No error details available'}
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <div className="space-y-3">
            <Button 
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full"
              size="lg"
              variant="default"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </>
              )}
            </Button>

            <Button 
              onClick={handleLogout}
              className="w-full"
              size="lg"
              variant="outline"
            >
              Log Out and Try Again
            </Button>
            
            <p className="text-sm text-gray-500">
              If the problem persists, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
