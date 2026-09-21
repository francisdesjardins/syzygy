// This playground renders no API reference. The declaration is here because `corona`'s barrel names
// its whole surface, so the type-checker walks the viewer whether a page mounts it or not — and a
// missing shim is an error about somebody else's plugin on a page that has none.
declare module 'virtual:api-model' {
  export type { ApiCategory, ApiMember, ApiSymbol, DocPart } from 'corona/contract';

  const model: readonly import('corona/contract').ApiCategory[];
  export default model;
}
