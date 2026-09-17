export function isDevelopmentEnv(): boolean {
  // Check if we're in browser environment and development mode is forced
  const forceDev = typeof window !== 'undefined' && window.localStorage.getItem('demo') === 'true';

  return forceDev || process.env['NODE_ENV'] !== 'production';
}
