/**
 * Normalizes unknown errors into structured diagnostic information
 * for display and debugging purposes.
 */

export interface ErrorDiagnostics {
  message: string;
  stack?: string;
  cause?: string;
  type?: string;
  agentError?: string;
  raw?: string;
}

/**
 * Extracts structured error diagnostics from an unknown error object
 */
export function normalizeError(error: unknown): ErrorDiagnostics {
  if (!error) {
    return {
      message: 'Unknown error occurred',
      raw: String(error),
    };
  }

  // Handle Error instances
  if (error instanceof Error) {
    const diagnostics: ErrorDiagnostics = {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
    };

    // Extract nested cause if present
    if ('cause' in error && error.cause) {
      diagnostics.cause = error.cause instanceof Error 
        ? error.cause.message 
        : String(error.cause);
    }

    // Check for agent-specific error fields
    const errorObj = error as any;
    if (errorObj.reject_code !== undefined) {
      diagnostics.agentError = `Reject code: ${errorObj.reject_code}`;
    }
    if (errorObj.reject_message) {
      diagnostics.agentError = diagnostics.agentError 
        ? `${diagnostics.agentError}, Message: ${errorObj.reject_message}`
        : `Reject message: ${errorObj.reject_message}`;
    }

    return diagnostics;
  }

  // Handle plain objects with message property
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as any;
    
    const diagnostics: ErrorDiagnostics = {
      message: errorObj.message || errorObj.error || 'Unknown error',
      type: errorObj.name || errorObj.type,
    };

    if (errorObj.stack) {
      diagnostics.stack = String(errorObj.stack);
    }

    if (errorObj.cause) {
      diagnostics.cause = String(errorObj.cause);
    }

    // Agent error fields
    if (errorObj.reject_code !== undefined || errorObj.reject_message) {
      diagnostics.agentError = [
        errorObj.reject_code !== undefined ? `Code: ${errorObj.reject_code}` : null,
        errorObj.reject_message ? `Message: ${errorObj.reject_message}` : null,
      ].filter(Boolean).join(', ');
    }

    diagnostics.raw = JSON.stringify(error, null, 2);
    return diagnostics;
  }

  // Handle primitive values
  return {
    message: String(error),
    raw: String(error),
  };
}

/**
 * Formats error diagnostics as a human-readable string
 */
export function formatDiagnostics(diagnostics: ErrorDiagnostics): string {
  const parts: string[] = [];

  if (diagnostics.type) {
    parts.push(`Type: ${diagnostics.type}`);
  }

  parts.push(`Message: ${diagnostics.message}`);

  if (diagnostics.agentError) {
    parts.push(`Agent Error: ${diagnostics.agentError}`);
  }

  if (diagnostics.cause) {
    parts.push(`Cause: ${diagnostics.cause}`);
  }

  if (diagnostics.stack) {
    parts.push(`\nStack Trace:\n${diagnostics.stack}`);
  }

  if (diagnostics.raw && diagnostics.raw !== diagnostics.message) {
    parts.push(`\nRaw Error:\n${diagnostics.raw}`);
  }

  return parts.join('\n');
}
