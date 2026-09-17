// The shape is corona's, not this plugin's: the viewer and the generator agree on a contract
// that neither of them owns alone, so a model that drifts fails here rather than on the page.
declare module 'virtual:api-model' {
  export type { ApiCategory, ApiMember, ApiSymbol, DocPart } from 'corona/contract';

  const model: readonly import('corona/contract').ApiCategory[];
  export default model;
}
