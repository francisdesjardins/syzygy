interface HandleMisusedPromiseOptions {
  /** Custom error handler function */
  onError?: (error: unknown, context?: string) => void;
  /** Context string for better debugging */
  context?: string;
  /** Whether to log errors to console (default: true in development) */
  logErrors?: boolean;
  /** Whether to rethrow errors after handling (default: false) */
  rethrow?: boolean;
}

/**
 * Creates a void function that safely handles a promise-returning function.
 * Used to avoid @typescript-eslint/no-misused-promises warnings in event handlers.
 *
 * @param promiseFn - The promise-returning function to wrap
 * @param options - Configuration options for error handling
 * @returns A void function that executes the promise safely
 *
 * @example
 * // Basic usage
 * const handleClick = handleMisusedPromise(async () => {
 *   await saveData();
 * });
 *
 * @example
 * // With custom error handling
 * const handleSubmit = handleMisusedPromise(
 *   async (data) => await submitForm(data),
 *   {
 *     context: 'Form submission',
 *     onError: (error) => showToast('Failed to submit form'),
 *   }
 * );
 */
export const handleMisusedPromise = <TArgs extends unknown[], TReturn>(
  promiseFn: (...args: TArgs) => Promise<TReturn>,
  options: HandleMisusedPromiseOptions = {},
) => {
  const {
    onError,
    context,
    logErrors = process.env.NODE_ENV === "development",
    rethrow = false,
  } = options;

  return (...args: TArgs): void => {
    promiseFn(...args).catch((error: unknown) => {
      // Enhanced error information
      const errorContext = context ? `[${context}]` : "[Promise Handler]";
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Log to console if enabled
      if (logErrors) {
        console.error(`${errorContext} Unhandled promise rejection:`, {
          error,
          message: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
          args: args.length > 0 ? args : undefined,
        });
      }

      // Call custom error handler if provided
      if (onError) {
        try {
          onError(error, context);
        } catch (handlerError) {
          console.error(`${errorContext} Error in custom error handler:`, handlerError);
        }
      }

      // Rethrow if requested (useful for testing)
      if (rethrow) {
        throw error;
      }
    });
  };
};
