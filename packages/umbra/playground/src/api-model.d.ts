// Re-exported from the emitting plugin rather than restated, so the pages cannot type-check against
// a stale projection.
declare module 'virtual:api-model' {
  export type { ApiCategory, ApiMember, ApiSymbol, DocPart } from '../vite-plugins/api-model.ts';

  const model: readonly import('../vite-plugins/api-model.ts').ApiCategory[];
  export default model;
}
