import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Copy, Check, ChevronDown } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { normalizeError, formatDiagnostics } from '../../utils/errorDiagnostics';

interface BootErrorScreenProps {
  errorType: 'actor' | 'profile';
  errorMessage: string;
  errorObject?: unknown;
  principal?: string;
  hasActor: boolean;
  attemptNumber: number;
  isRetrying: boolean;
  onRetry: () => Promise<void>;
}

export default function BootErrorScreen({ 
  errorType, 
  errorMessage, 
  errorObject,
  principal, 
  hasActor, 
  attemptNumber,
  isRetrying,
  onRetry 
}: BootErrorScreenProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleRetry = async () => {
    await onRetry();
  };

  // Normalize error for detailed diagnostics
  const diagnostics = normalizeError(errorObject);
  const formattedDiagnostics = formatDiagnostics(diagnostics);

  const handleCopyDetails = async () => {
    const fullDiagnostics = `
Moritz Care Home - Deployment Error Diagnostics
================================================
Error Type: ${errorType === 'actor' ? 'Actor Initialization Failure' : 'Profile Fetch Failure'}
Attempt Number: ${attemptNumber}
Principal: ${principal || 'Not available'}
Actor Available: ${hasActor ? 'Yes' : 'No'}
Timestamp: ${new Date().toISOString()}

${formattedDiagnostics}
    `.trim();

    try {
      await navigator.clipboard.writeText(fullDiagnostics);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const primaryMessage = errorType === 'actor' 
    ? 'Unable to connect to the backend'
    : 'Profile fetch failed';

  const secondaryMessage = errorType === 'actor'
    ? 'This may be due to a temporary connection issue or deployment problem.'
    : 'This may be due to a temporary connection issue or configuration problem.';

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
            Deployment Failed
          </h1>
          
          <p className="text-gray-600 mb-2">
            {primaryMessage}
          </p>
          
          <p className="text-sm text-gray-500 mb-4">
            {secondaryMessage}
          </p>

          {attemptNumber > 0 && (
            <div className="mb-4 text-sm text-gray-500">
              Attempt #{attemptNumber + 1}
            </div>
          )}

          <Collapsible open={showDetails} onOpenChange={setShowDetails} className="mb-6">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-sm text-gray-500 hover:text-gray-700">
                <ChevronDown className={`mr-1 h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                {showDetails ? 'Hide' : 'Show'} Error Details
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="bg-gray-50 rounded-md p-4 text-left space-y-3">
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-gray-700">Error Type:</p>
                  <p className="text-gray-600 ml-2">
                    {errorType === 'actor' ? 'Actor Initialization Failure' : 'Profile Fetch Failure'}
                  </p>
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-semibold text-gray-700">Deployment Status:</p>
                  <p className="text-gray-600 ml-2">
                    {isRetrying ? 'Retrying...' : 'Failed'}
                  </p>
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-semibold text-gray-700">Attempt Number:</p>
                  <p className="text-gray-600 ml-2">#{attemptNumber + 1}</p>
                </div>
                
                {principal && (
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-gray-700">Principal:</p>
                    <p className="text-gray-600 ml-2 font-mono break-all text-[10px]">{principal}</p>
                  </div>
                )}
                
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-gray-700">Actor Status:</p>
                  <p className="text-gray-600 ml-2">{hasActor ? 'Available' : 'Not Available'}</p>
                </div>
                
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-gray-700">Error Message:</p>
                  <p className="text-gray-600 ml-2 font-mono break-words text-[10px]">
                    {diagnostics.message || 'No error details available'}
                  </p>
                </div>

                {diagnostics.type && (
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-gray-700">Error Type:</p>
                    <p className="text-gray-600 ml-2 font-mono">{diagnostics.type}</p>
                  </div>
                )}

                {diagnostics.agentError && (
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-gray-700">Agent Error:</p>
                    <p className="text-gray-600 ml-2 font-mono break-words text-[10px]">{diagnostics.agentError}</p>
                  </div>
                )}

                {diagnostics.cause && (
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-gray-700">Cause:</p>
                    <p className="text-gray-600 ml-2 font-mono break-words text-[10px]">{diagnostics.cause}</p>
                  </div>
                )}

                {diagnostics.stack && (
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-gray-700">Stack Trace:</p>
                    <pre className="text-gray-600 ml-2 font-mono break-words text-[9px] whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {diagnostics.stack}
                    </pre>
                  </div>
                )}

                <Button
                  onClick={handleCopyDetails}
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-3 w-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-3 w-3" />
                      Copy Full Diagnostics
                    </>
                  )}
                </Button>
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
                  Retrying Deployment...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Deployment
                </>
              )}
            </Button>

            <Button 
              onClick={handleLogout}
              className="w-full"
              size="lg"
              variant="outline"
              disabled={isRetrying}
            >
              Log Out and Try Again
            </Button>
            
            <p className="text-sm text-gray-500">
              If the problem persists, please copy the error details and contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
