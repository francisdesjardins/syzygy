import type { ComponentType, ReactNode } from 'react';

/**
 * What a generated API model has to look like, and what the viewer needs borrowed from its host.
 *
 * **The generator is not here.** Producing this model means running typedoc over one library's
 * entry points, and the two libraries do that differently enough that the two plugins share only
 * about half their lines. What they can share is the shape they agree to emit — so this file is
 * the seam: the Vite plugin of each playground that documents a library fills `virtual:api-model`
 * with these types, and the
 * viewer in this package reads them without knowing which library it is looking at.
 */

/** `link` is a symbol key when the referenced name is exported, a bare name when it is not. */
export type DocPart = { readonly text: string; readonly link?: string };

export type ApiMember = {
  readonly name: string;
  readonly summary: string;
  readonly type: readonly DocPart[];
  readonly optional: boolean;
};

export type ApiSymbol = {
  /** `specifier#name`. */
  readonly key: string;
  readonly name: string;
  /**
   * A union wide enough for every generator, not just the one being read.
   *
   * Only one of the two libraries exports a class, and the other's plugin never emits this kind at
   * all — which is fine in that direction. A generator narrower than the contract is sound; a page
   * narrower than its own model type is the bug, because it cannot render what the type permits.
   */
  readonly kind: 'function' | 'variable' | 'type' | 'class';
  /** Which page it lives on — the `id` of its {@link ApiCategory}. */
  readonly category: string;
  readonly specifier: string;
  /** The declaration as a reader would write it, with referenced symbols kept linkable. */
  readonly signature: readonly DocPart[];
  readonly summary: readonly DocPart[];
  readonly remarks: readonly DocPart[];
  readonly see: readonly (readonly DocPart[])[];
  readonly examples: readonly string[];
  readonly typeParams: readonly ApiMember[];
  readonly params: readonly ApiMember[];
  readonly returns: readonly DocPart[];
  readonly members: readonly ApiMember[];
};

export type ApiCategory = {
  readonly id: string;
  readonly label: string;
  readonly specifier: string;
  readonly blurb: string;
  readonly symbols: readonly ApiSymbol[];
};

/**
 * The slots the host fills: components the viewer renders through rather than owning.
 *
 * Every one of these exists on both sides and none of them is the same code: one `CodeBlock` takes
 * `code` and a language, the other takes `source` and highlights by inference; the buttons differ
 * on a default. Those are the products differing, which is allowed and is not this package's
 * business. Naming the contract narrowly — the props the reference page actually passes — is what
 * lets both keep their own component and share the page that uses it.
 */
export type ApiSlots = {
  readonly PageLayout: ComponentType<{
    readonly title: string;
    readonly description: string;
    readonly actions?: ReactNode | undefined;
    readonly children: ReactNode;
  }>;
  readonly SurfaceCard: ComponentType<{
    readonly interactive?: boolean;
    readonly children: ReactNode;
  }>;
  /** Highlighted source. The host decides the language; the reference only ever shows TSX. */
  readonly CodeBlock: ComponentType<{
    readonly source: string;
    readonly wrap?: boolean;
  }>;
  readonly AppButton: ComponentType<{
    readonly size?: 'small' | undefined;
    readonly className?: string | undefined;
    readonly onClick?: (() => void) | undefined;
    readonly children: ReactNode;
  }>;
  /** The section heading and grid the index page groups entry points with. */
  readonly ExampleSection: ComponentType<{
    readonly title: string;
    readonly description?: string | undefined;
    readonly children: ReactNode;
  }>;
  readonly ExampleGrid: ComponentType<{
    /** Required in the hosts, so the contract states it too rather than widening what they accept. */
    readonly columns: 1 | 2;
    readonly children: ReactNode;
  }>;
  /** Icons are placed by the page, so each takes the class that places it. */
  readonly icons: {
    readonly ArrowBackIcon: ComponentType<{ readonly className?: string | undefined }>;
    readonly ArrowForwardIcon: ComponentType<{ readonly className?: string | undefined }>;
    readonly LinkIcon: ComponentType<{ readonly className?: string | undefined }>;
    readonly SearchIcon: ComponentType<{ readonly className?: string | undefined }>;
  };
};

/**
 * The library's own doors, which the index page leads with.
 *
 * Data, not code: the two indexes were identical apart from these three tables — which entry
 * points exist, what each one is for, and what to call it. That is the whole of what a reference
 * page knows about the library it documents that its model does not already say.
 */
export type ApiEntryPoints = {
  /** The calls an application writes, shown as chips. Qualified by specifier where a name repeats. */
  readonly doors: readonly { readonly specifier: string; readonly name: string }[];
  /** One sentence per specifier, keyed by it. */
  readonly blurbs: Readonly<Record<string, string>>;
  /** The short label for a specifier — `Core`, `React binding`. */
  readonly labels: Readonly<Record<string, string>>;
};
