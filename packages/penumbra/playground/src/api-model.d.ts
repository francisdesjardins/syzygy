// This playground renders no API reference — it has no library to document. The declaration is
// here because `corona`'s barrel names its whole surface, so the type-checker walks the viewer
// whether or not a page mounts it, and the viewer reads its model from a module the generator
// provides. A missing shim is an error about somebody else's plugin on a page that has none.
declare module 'virtual:api-model' {
  export type { ApiCategory, ApiMember, ApiSymbol, DocPart } from 'corona/contract';

  const model: readonly import('corona/contract').ApiCategory[];
  export default model;
}
