/** What a route shows while its chunk is still arriving. */
export function RoutePending() {
  return <p style={{ color: 'var(--app-text-tertiary)' }}>Loading…</p>;
}
