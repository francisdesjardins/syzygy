/**
 * The model the host's Vite plugin supplies, declared here so this package type-checks alone.
 *
 * Each playground declares the same module against the same contract; whichever program a file of
 * this package is compiled in, the shape it reads is this one.
 */
declare module 'virtual:api-model' {
  export type { ApiCategory, ApiMember, ApiSymbol, DocPart } from './contract.ts';

  const model: readonly import('./contract.ts').ApiCategory[];
  export default model;
}
