import { execFile } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import type { Plugin } from 'vite';

// Asynchronous, and that is the point: typedoc is a subprocess of a few seconds, and spawning it
// synchronously would freeze the thread the rest of the graph is transformed on.
const execFileAsync = promisify(execFile);

// ── virtual:antumbra-api ─────────────────────────────────────────────────────
// Projects typedoc's graph over the library's entry points into a compact model, so the reference
// renders with this site's own components rather than an iframed second design system.

const VIRTUAL_ID = 'virtual:antumbra-api';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

const CORE = 'antumbra';
const REACT = 'antumbra/react';
const SOLID = 'antumbra/solid';
const VANILLA = 'antumbra/vanilla';

const ENTRY_LABEL: Record<string, string> = {
  index: CORE,
  react: REACT,
  solid: SOLID,
  vanilla: VANILLA,
};

/**
 * How a symbol is addressed downstream: the specifier it ships from, then its name. The bindings
 * export the same words with different signatures, so keying on the bare name shows one binding's
 * declaration under another's specifier.
 */
export const symbolKey = (specifier: string, name: string): string => {
  return `${specifier}#${name}`;
};

/** Typedoc's `ReflectionKind`, narrowed to what the page groups by. */
const KIND: Record<number, ApiSymbol['kind']> = {
  32: 'variable',
  64: 'function',
  // The package's errors are classes, and a reference that drops them drops the four names a
  // `catch` block is written against.
  128: 'class',
  // An interface reads as a type on the page, and four of them are public: the registries a project
  // augments. Unmapped, the reference silently omits the symbols adopters must find.
  256: 'type',
  2097152: 'type',
};

/**
 * The reader-facing table of contents, one page per entry, hand-written because typedoc's output
 * carries no such shape: it knows which file a symbol came from, not which idea it belongs to.
 *
 * `symbols` is the render order, and **every export must appear exactly once** or `buildModel`
 * throws. That gate is the point of writing it by hand — a new export nobody filed is a new export
 * nobody can find, and an alphabetical dump would hide that by having somewhere to put everything.
 */
export const CATEGORIES: readonly CategoryDef[] = [
  {
    id: 'declaring',
    label: 'Declaring a bootstrap',
    specifier: CORE,
    blurb: 'The three calls an application writes. Everything else is read, not written.',
    symbols: [
      'createBootstrap',
      'defineStep',
      'defineMountedStep',
      'Bootstrap',
      'BootstrapOptions',
      'CreateBootstrapOptions',
    ],
  },
  {
    id: 'steps',
    label: 'Steps',
    specifier: CORE,
    blurb: 'What one piece of startup work is, what it may read, and what it may do.',
    symbols: [
      'Step',
      'AnyStep',
      'StepPhase',
      'StepScope',
      'StepReturn',
      'StepContext',
      'PreflightContext',
      'MountedContext',
      'StepStatus',
      'StepTrace',
      'StepFailure',
      'IdsOf',
      'StepListCheck',
    ],
  },
  {
    id: 'registries',
    label: 'The registries',
    specifier: CORE,
    blurb:
      'The four interfaces a project augments, and the types read off them. Declare none and everything still works, with open ids and unknown payloads.',
    symbols: [
      'StepRegistry',
      'NoticeRegistry',
      'IntentRegistry',
      'UiPort',
      'StepId',
      'NoticeType',
      'IntentType',
      'DataOf',
      'PayloadArgs',
    ],
  },
  {
    id: 'outcome',
    label: 'What a run produced',
    specifier: CORE,
    blurb:
      'One frozen object. The status is the only thing an app must read to know whether it may mount.',
    symbols: [
      'Outcome',
      'RunStatus',
      'RunData',
      'PartialRunData',
      'Notice',
      'Intent',
      'IntentStatus',
      'BootstrapPlan',
      'PlanLevel',
      'readStepData',
      'SerializedError',
      'AbortReason',
      'AbortReasonKind',
    ],
  },
  {
    id: 'live',
    label: 'The live half',
    specifier: CORE,
    blurb:
      'Everything that moves after the run settles: the intent queue, the mounted phase, and the observable snapshot a binding reads.',
    symbols: [
      'Session',
      'SessionState',
      'MountReport',
      'attachIntentHost',
      'AttachedIntentHost',
      'IntentHostOptions',
      'IntentControls',
      'ForwardedIntent',
      'RunObserver',
      'RunSnapshot',
      'RunStage',
      'ReadableStore',
      'Store',
    ],
  },
  {
    id: 'watching',
    label: 'Watching a run happen',
    specifier: CORE,
    blurb: 'What the outcome cannot tell you, because it only exists once the run is over.',
    symbols: ['RunEvent'],
  },
  {
    id: 'shared',
    label: 'More than one module beside each other',
    specifier: CORE,
    blurb: 'Work that is the same answer for everybody, done once.',
    symbols: ['clearSharedScope'],
  },
  {
    id: 'errors',
    label: 'Errors and utilities',
    specifier: CORE,
    blurb: 'What this package throws, and the two helpers worth exporting.',
    symbols: [
      'BootstrapError',
      'PlanError',
      'StepSkippedError',
      'UndeclaredDependencyError',
      'normalizeError',
      'systemClock',
      'Clock',
      'DEFAULT_DEADLINE_MS',
    ],
  },
  {
    id: 'react',
    label: 'React binding',
    specifier: REACT,
    blurb:
      'Five names over the core, which this entry re-exports whole — so a React app imports from this path only.',
    symbols: [
      'BootstrapProvider',
      'useBootstrap',
      'useBootstrapContext',
      'useStepData',
      'useIntentHost',
    ],
  },
  {
    id: 'solid',
    label: 'Solid binding',
    specifier: SOLID,
    blurb:
      'The same five names, plus `fromStore`. Every value is an accessor, so do not destructure what these return.',
    symbols: [
      'BootstrapProvider',
      'useBootstrap',
      'useBootstrapContext',
      'useStepData',
      'useIntentHost',
      'fromStore',
    ],
  },
  {
    id: 'vanilla',
    label: 'Controller binding',
    specifier: VANILLA,
    blurb:
      'No hooks, no provider, no rendering: it connects the queue to markup you already wrote, with no framework optional or otherwise.',
    symbols: ['bindBootstrap', 'BindOptions', 'BoundBootstrap'],
  },
];

type CategoryDef = {
  readonly id: string;
  readonly label: string;
  readonly specifier: string;
  readonly blurb: string;
  readonly symbols: readonly string[];
};

/** One reflection typedoc emitted, and the entry point it was materialised under. */
type Declaration = { readonly node: Node; readonly specifier: string };

/** A named thing inside a symbol: a parameter, a type parameter, or an object member. */
export type ApiMember = {
  readonly name: string;
  readonly summary: string;
  readonly type: readonly DocPart[];
  readonly optional: boolean;
};

/** `link` is a {@link symbolKey} when exported, a bare name when not (rendered as inline code). */
export type DocPart = { readonly text: string; readonly link?: string };

export type ApiSymbol = {
  /** `specifier#name` — see {@link symbolKey}. */
  readonly key: string;
  readonly name: string;
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

type CommentPart = { kind: string; text?: string; tag?: string; target?: unknown };
type Comment = { summary?: CommentPart[]; blockTags?: { tag: string; content: CommentPart[] }[] };
type Flags = { isOptional?: boolean; isRest?: boolean; isReadonly?: boolean };
type Node = {
  id?: number;
  name: string;
  kind: number;
  flags?: Flags;
  comment?: Comment;
  signatures?: Node[];
  children?: Node[];
  parameters?: Node[];
  typeParameters?: Node[];
  type?: TypeNode;
  default?: TypeNode;
  extendedTypes?: TypeNode[];
};

/** Typedoc's serialized type tree. Every `type` discriminant it emits is handled by `printType`. */
type TypeNode = {
  type?: string;
  name?: string;
  value?: unknown;
  types?: TypeNode[];
  typeArguments?: TypeNode[];
  elementType?: TypeNode;
  elements?: TypeNode[];
  element?: TypeNode;
  target?: unknown;
  declaration?: Node;
  objectType?: TypeNode;
  indexType?: TypeNode;
  checkType?: TypeNode;
  extendsType?: TypeNode;
  trueType?: TypeNode;
  falseType?: TypeNode;
  operator?: string;
  queryType?: TypeNode;
  head?: string;
  tail?: [TypeNode, string][];
  parameter?: string;
  parameterType?: TypeNode;
  templateType?: TypeNode;
  optionalModifier?: string;
  readonlyModifier?: string;
  isOptional?: boolean;
};

/**
 * Undo the source file's 100-column hard wrap, which renders as a ragged half-width paragraph.
 * Single newlines become spaces; blank lines and lines opening a list, heading, quote or table are
 * meaning rather than formatting, and are left alone.
 */
function reflow(value: string): string {
  // `(?<!\n)` stops a paragraph break's second newline being eaten into a stray leading space.
  return value.replace(/(?<!\n)\n(?!\n)(?![ \t]*(?:[-*+]|\d+\.|#|>|\|))/g, ' ');
}

/** Flatten typedoc's comment parts, newlines and all — the form code samples need. */
function rawText(parts: CommentPart[] | undefined): string {
  return (parts ?? [])
    .map((part) => {
      return part.text ?? '';
    })
    .join('')
    .trim();
}

/** Flatten to prose — for places that render no links. */
function text(parts: CommentPart[] | undefined): string {
  return reflow(rawText(parts));
}

/**
 * Same, keeping `{@link}` targets as links: an inline tag's numeric `target` maps back through
 * `names`, the name resolves against the linking symbol's specifier, and anything neither step
 * answers degrades to the author's text.
 */
function doc(parts: CommentPart[] | undefined, ctx: PrintContext): DocPart[] {
  return (parts ?? [])
    .map((part) => {
      const target = typeof part.target === 'number' ? ctx.names.get(part.target) : undefined;
      // A target the entry points do not export keeps its bare name; the page renders it as code.
      return part.kind === 'inline-tag' && target !== undefined
        ? { text: part.text ?? target, link: ctx.resolve(target) ?? target }
        : { text: reflow(part.text ?? '') };
    })
    .filter((part) => {
      return part.text !== '';
    });
}

function blockTag(
  comment: Comment | undefined,
  options: PrintContext & { tag: string }
): DocPart[] {
  const found = comment?.blockTags?.find((entry) => {
    return entry.tag === options.tag;
  });
  return doc(found?.content, options);
}

/** Typedoc hands `@example` back as a fenced markdown block; the page renders code, not markdown. */
function unfence(block: string): string {
  const trimmed = block.trim();
  if (!trimmed.startsWith('```')) {
    return trimmed;
  }
  const lines = trimmed.split('\n');
  const inner = lines.slice(1, lines.at(-1)?.startsWith('```') === true ? -1 : undefined);
  return inner.join('\n').trim();
}

function allBlockTags(comment: Comment | undefined, tag: string): string[] {
  return (comment?.blockTags ?? [])
    .filter((entry) => {
      return entry.tag === tag;
    })
    .map((entry) => {
      return unfence(rawText(entry.content));
    })
    .filter((example) => {
      return example !== '';
    });
}

// ── Type printing ────────────────────────────────────────────────────────────
// A signature cannot be paraphrased, so the printer covers every `type` discriminant typedoc emits
// and reports what it does not recognise rather than printing something plausible and wrong.

/** Emits tokens, merging plain runs so the page renders a handful of spans, not hundreds. */
class Tokens {
  private readonly parts: DocPart[] = [];

  push(value: string): void {
    const last = this.parts.at(-1);
    if (last !== undefined && last.link === undefined) {
      this.parts[this.parts.length - 1] = { text: last.text + value };
      return;
    }
    this.parts.push({ text: value });
  }

  link(name: string, key: string): void {
    this.parts.push({ text: name, link: key });
  }

  done(): DocPart[] {
    return this.parts;
  }
}

type PrintContext = {
  /**
   * The symbol a name means *here*, as a {@link symbolKey}, else `undefined`. Own specifier first,
   * then the core, driven by the category table rather than by where typedoc materialised a
   * declaration — so a link out of the Solid chapter lands in the Solid chapter.
   */
  readonly resolve: (name: string) => string | undefined;
  readonly warn: (message: string) => void;
  /** Every reflection id in the project, so an inline `{@link}`'s numeric target resolves. */
  readonly names: Map<number, string>;
  /**
   * How many anonymous objects deep this print already is. One level is expanded field by field;
   * below that the placeholder comes back, because a step's `run` would otherwise drag its whole
   * context type into a signature line.
   */
  readonly depth?: number | undefined;
};

/**
 * The context plus the token sink — one object, not an `(out, ctx)` pair threaded through a dozen
 * mutually recursive functions, so a call needing a separator spreads it in.
 */
type Printer = PrintContext & { readonly out: Tokens };

/**
 * An object literal type prints as a placeholder **where a members table follows it** — which is
 * true of a symbol's own declaration line and false of a parameter's type, so the two are no longer
 * printed the same way. A parameter that said `step: { … }` promised a table that is never rendered
 * for it, and `defineStep`'s object is the most important shape in the package.
 */
const OBJECT_PLACEHOLDER = '{ … }';

function printCallSignature(signature: Node, printer: Printer): void {
  const { out } = printer;
  printTypeParams(signature.typeParameters, printer);
  printParams(signature.parameters, printer);
  out.push(' => ');
  printType(signature.type, printer);
}

/** Typedoc's placeholder for a destructured parameter — a React component's props object. */
const DESTRUCTURED = '__namedParameters';

function paramName(param: Node): string {
  return param.name === DESTRUCTURED ? 'props' : param.name;
}

function printParams(params: Node[] | undefined, printer: Printer): void {
  const { out } = printer;
  out.push('(');
  (params ?? []).forEach((param, index) => {
    if (index > 0) {
      out.push(', ');
    }
    out.push(
      `${param.flags?.isRest === true ? '...' : ''}${paramName(param)}${param.flags?.isOptional === true ? '?' : ''}: `
    );
    printType(param.type, printer);
  });
  out.push(')');
}

function printTypeParams(params: Node[] | undefined, printer: Printer): void {
  if (params === undefined || params.length === 0) {
    return;
  }
  const { out } = printer;
  out.push('<');
  params.forEach((param, index) => {
    if (index > 0) {
      out.push(', ');
    }
    out.push(param.name);
    if (param.type !== undefined) {
      out.push(' extends ');
      printType(param.type, printer);
    }
    if (param.default !== undefined) {
      out.push(' = ');
      printType(param.default, printer);
    }
  });
  out.push('>');
}

function printList(nodes: TypeNode[] | undefined, printer: Printer & { separator: string }) {
  const { out, separator } = printer;
  (nodes ?? []).forEach((node, index) => {
    if (index > 0) {
      out.push(separator);
    }
    printType(node, printer);
  });
}

function printType(node: TypeNode | undefined, printer: Printer): void {
  const { out } = printer;
  if (node === undefined) {
    out.push('unknown');
    return;
  }

  switch (node.type) {
    case undefined: {
      printer.warn('a type node arrived with no discriminant');
      out.push('unknown');
      return;
    }
    case 'intrinsic':
    case 'unknown': {
      out.push(node.name ?? 'unknown');
      return;
    }
    case 'literal': {
      out.push(typeof node.value === 'string' ? `'${node.value}'` : String(node.value));
      return;
    }
    case 'reference': {
      const name = node.name ?? 'unknown';
      const key = printer.resolve(name);
      if (key !== undefined) {
        out.link(name, key);
      } else {
        out.push(name);
      }
      if (node.typeArguments !== undefined && node.typeArguments.length > 0) {
        out.push('<');
        printList(node.typeArguments, { ...printer, separator: ', ' });
        out.push('>');
      }
      return;
    }
    case 'union': {
      printList(node.types, { ...printer, separator: ' | ' });
      return;
    }
    case 'intersection': {
      printList(node.types, { ...printer, separator: ' & ' });
      return;
    }
    case 'array': {
      // `(A | B)[]` — an unparenthesised union would bind to the last member only.
      const composite =
        node.elementType?.type === 'union' || node.elementType?.type === 'intersection';
      out.push(composite ? '(' : '');
      printType(node.elementType, printer);
      out.push(composite ? ')[]' : '[]');
      return;
    }
    case 'tuple': {
      out.push('[');
      printList(node.elements, { ...printer, separator: ', ' });
      out.push(']');
      return;
    }
    case 'namedTupleMember': {
      out.push(`${node.name ?? ''}${node.isOptional === true ? '?' : ''}: `);
      printType(node.element, printer);
      return;
    }
    case 'indexedAccess': {
      printType(node.objectType, printer);
      out.push('[');
      printType(node.indexType, printer);
      out.push(']');
      return;
    }
    case 'typeOperator': {
      out.push(`${node.operator ?? 'keyof'} `);
      printType(asTypeNode(node.target), printer);
      return;
    }
    case 'query': {
      out.push('typeof ');
      printType(node.queryType, printer);
      return;
    }
    case 'conditional': {
      printType(node.checkType, printer);
      out.push(' extends ');
      printType(node.extendsType, printer);
      out.push(' ? ');
      printType(node.trueType, printer);
      out.push(' : ');
      printType(node.falseType, printer);
      return;
    }
    case 'mapped': {
      out.push(`{ [${node.parameter ?? 'K'} in `);
      printType(node.parameterType, printer);
      out.push(`]${node.optionalModifier === '+' ? '?' : ''}: `);
      printType(node.templateType, printer);
      out.push(' }');
      return;
    }
    case 'templateLiteral': {
      out.push(`\`${node.head ?? ''}`);
      for (const [inner, literal] of node.tail ?? []) {
        out.push('${');
        printType(inner, printer);
        out.push(`}${literal}`);
      }
      out.push('`');
      return;
    }
    case 'reflection': {
      const declaration = node.declaration;
      const signature = declaration?.signatures?.[0];
      if (signature !== undefined) {
        printCallSignature(signature, printer);
        return;
      }
      const fields = declaration?.children ?? [];
      // `string & {}` is the branding idiom behind `StepId`: an object with no members at all.
      // Printed as the placeholder it advertised a table with nothing in it, on ten rows.
      if (fields.length === 0) {
        out.push('{}');
        return;
      }
      const depth = printer.depth ?? 0;
      if (depth > 0) {
        out.push(OBJECT_PLACEHOLDER);
        return;
      }
      out.push('{ ');
      fields.forEach((field, index) => {
        if (index > 0) {
          out.push('; ');
        }
        out.push(`${field.name}${field.flags?.isOptional === true ? '?' : ''}: `);
        printType(field.type, { ...printer, depth: depth + 1 });
      });
      out.push(' }');
      return;
    }
    default: {
      // Unhandled prints `unknown` and warns, rather than a signature the compiler would reject.
      printer.warn(`unhandled type kind "${node.type ?? 'undefined'}"`);
      out.push('unknown');
      return;
    }
  }
}

/** `target` is typedoc's slot for both a reflection id and a nested type; only objects are types. */
function asTypeNode(value: unknown): TypeNode | undefined {
  return typeof value === 'object' && value !== null ? { ...value } : undefined;
}

/** The declaration line a reader would write themselves. */
function printSignature(
  node: Node,
  options: PrintContext & { kind: ApiSymbol['kind'] }
): DocPart[] {
  const { kind } = options;
  const out = new Tokens();
  const printer: Printer = { ...options, out };
  const signature = node.signatures?.[0];

  if (kind === 'function' && signature !== undefined) {
    out.push(node.name);
    printTypeParams(signature.typeParameters, printer);
    printParams(signature.parameters, printer);
    out.push(': ');
    printType(signature.type, printer);
    return out.done();
  }

  if (kind === 'variable') {
    out.push(`const ${node.name}: `);
    printType(node.type, printer);
    return out.done();
  }

  if (kind === 'class') {
    out.push(`class ${node.name}`);
    printTypeParams(node.typeParameters, printer);
    const base = node.extendedTypes?.[0];
    if (base !== undefined) {
      out.push(' extends ');
      printType(base, printer);
    }
    return out.done();
  }

  out.push(`type ${node.name}`);
  printTypeParams(node.typeParameters, printer);
  out.push(' = ');
  // An object-literal alias has children and no `type`; its shape is the members table below.
  if (node.type === undefined && (node.children ?? []).length > 0) {
    out.push(OBJECT_PLACEHOLDER);
    return out.done();
  }
  printType(node.type, printer);
  return out.done();
}

// ── Projection ───────────────────────────────────────────────────────────────

/**
 * A type parameter's "type" is its constraint or default, never the parameter itself — printing it
 * as a property does renders every unconstrained one as a bogus `unknown` annotation.
 */
function toTypeParam(node: Node, ctx: PrintContext): ApiMember {
  const out = new Tokens();
  const printer: Printer = { ...ctx, out };
  if (node.type !== undefined) {
    out.push('extends ');
    printType(node.type, printer);
  } else if (node.default !== undefined) {
    out.push('= ');
    printType(node.default, printer);
  }
  return {
    name: node.name,
    summary: text(node.comment?.summary),
    type: out.done(),
    optional: false,
  };
}

function toMember(node: Node, ctx: PrintContext): ApiMember {
  const signature = node.signatures?.[0];
  return {
    name: paramName(node),
    summary: text((signature?.comment ?? node.comment)?.summary),
    type: (() => {
      const out = new Tokens();
      const printer: Printer = { ...ctx, out };
      if (signature !== undefined) {
        printCallSignature(signature, printer);
      } else {
        printType(node.type, printer);
      }
      return out.done();
    })(),
    optional: node.flags?.isOptional === true,
  };
}

/**
 * The fields a symbol exposes. Undescribed entries are kept — the type renders beside the name, and
 * `Escape: 'Escape'` needs no prose — and intersections are unwrapped so `A & { b }` lists `b`.
 */
function members(node: Node, ctx: PrintContext): ApiMember[] {
  const shapes: (TypeNode | undefined)[] =
    node.type?.type === 'intersection' ? (node.type.types ?? []) : [node.type];
  const props = node.signatures?.[0]?.parameters?.find((param) => {
    return param.name === DESTRUCTURED;
  });

  const children = [
    ...(node.children ?? []),
    ...shapes.flatMap((shape) => {
      return shape?.declaration?.children ?? [];
    }),
    ...(props?.type?.declaration?.children ?? []),
  ];

  return children.map((child) => {
    return toMember(child, ctx);
  });
}

function toSymbol(
  node: Node,
  where: PrintContext & { specifier: string; category: string }
): ApiSymbol | null {
  const { specifier, category, ...ctx } = where;
  const kind = KIND[node.kind];
  if (!kind) {
    return null;
  }
  // A function's prose lives on its signature, everything else on the declaration.
  const signature = node.signatures?.[0];
  const comment = signature?.comment ?? node.comment;

  return {
    key: symbolKey(specifier, node.name),
    name: node.name,
    kind,
    category,
    specifier,
    signature: printSignature(node, { ...ctx, kind }),
    summary: doc(comment?.summary, ctx),
    remarks: blockTag(comment, { ...ctx, tag: '@remarks' }),
    see: (comment?.blockTags ?? [])
      .filter((entry) => {
        return entry.tag === '@see';
      })
      .map((entry) => {
        return doc(entry.content, ctx);
      }),
    examples: allBlockTags(comment, '@example'),
    typeParams: (signature?.typeParameters ?? node.typeParameters ?? []).map((param) => {
      return toTypeParam(param, ctx);
    }),
    // Listed field by field under members already, so one anonymous `{ … }` here says nothing.
    params: (signature?.parameters ?? [])
      .filter((param) => {
        return param.name !== DESTRUCTURED;
      })
      .map((param) => {
        return toMember(param, ctx);
      }),
    returns: blockTag(comment, { ...ctx, tag: '@returns' }),
    members: members(node, ctx),
  };
}

function collectNames(root: Node): Map<number, string> {
  const names = new Map<number, string>();
  const walk = (node: Node) => {
    if (typeof node.id === 'number') {
      names.set(node.id, node.name);
    }
    for (const child of [...(node.children ?? []), ...(node.signatures ?? [])]) {
      walk(child);
    }
  };
  walk(root);
  return names;
}

/** Whatever a failed `execFileSync` captured, as text. */
function captured(error: unknown, stream: 'stdout' | 'stderr'): string {
  if (typeof error !== 'object' || error === null || !(stream in error)) {
    return '';
  }
  const value: unknown = Object.getOwnPropertyDescriptor(error, stream)?.value;
  return typeof value === 'string' ? value : (value?.toString() ?? '');
}

/**
 * Say what typedoc said: `execFile` captures both streams, so a failure arrives as `Command failed:
 * node …/typedoc` with the diagnostics unread on the error — which under `treatWarningsAsErrors` is
 * what a broken `{@link}` produces mid-`yarn dev`.
 */
export function typedocFailure(error: unknown): Error {
  const output = [captured(error, 'stdout'), captured(error, 'stderr')].join('').trim();
  const reason = error instanceof Error ? error.message : String(error);

  return new Error(
    output === ''
      ? `[antumbra-api] typedoc failed: ${reason}`
      : `[antumbra-api] typedoc failed — its own output follows.

${output}
`
  );
}

async function buildModel(
  repoRoot: string,
  run: { readonly cacheDir: string; readonly warn: (message: string) => void }
) {
  const { cacheDir, warn } = run;
  mkdirSync(cacheDir, { recursive: true });
  const jsonPath = join(cacheDir, 'typedoc.json');

  // The CLI writes the JSON (the programmatic serializer needs a filesystem it lacks here), with
  // `--out` at the cache so the committed docs are never touched.
  try {
    await execFileAsync(
      process.execPath,
      [
        join(repoRoot, 'node_modules', 'typedoc', 'bin', 'typedoc'),
        '--options',
        join(repoRoot, 'typedoc.json'),
        // Here, not in `typedoc.json`, so this projection owns its scope.
        '--entryPoints',
        'src/index.ts',
        '--entryPoints',
        'src/react.ts',
        '--entryPoints',
        'src/solid.ts',
        '--entryPoints',
        'src/vanilla.ts',
        '--json',
        jsonPath,
        '--out',
        join(cacheDir, 'html'),
      ],
      { cwd: repoRoot }
    );
  } catch (error) {
    throw typedocFailure(error);
  }

  const root = JSON.parse(readFileSync(jsonPath, 'utf8')) as Node;
  rmSync(join(cacheDir, 'html'), { recursive: true, force: true });
  const names = collectNames(root);

  // Two indexes because a re-exported type is **one** reflection: `DialogHandle` is named by all
  // three bindings but materialises under whichever entry point typedoc walked first, so a binding
  // must fall back to it. `UseDialogOptions` is the opposite — two aliases, two keys, no fallback.
  const declarations = new Map<string, Declaration>();
  const byName = new Map<string, Declaration[]>();
  for (const module of root.children ?? []) {
    const specifier = ENTRY_LABEL[module.name] ?? module.name;
    for (const child of module.children ?? []) {
      if (KIND[child.kind]) {
        const declaration = { node: child, specifier };
        declarations.set(symbolKey(specifier, child.name), declaration);
        byName.set(child.name, [...(byName.get(child.name) ?? []), declaration]);
      }
    }
  }

  /**
   * Its own declaration, else the single shared reflection, never a guess: two declarations of a
   * name are two types, and picking one shows the other's signature.
   */
  const declarationFor = (specifier: string, name: string): Declaration | undefined => {
    const own = declarations.get(symbolKey(specifier, name));
    if (own !== undefined) {
      return own;
    }
    const shared = byName.get(name) ?? [];
    return shared.length === 1 ? shared[0] : undefined;
  };

  // Where each name renders — built first, because a cross-reference resolves against it.
  const pageOf = new Set(
    CATEGORIES.flatMap((category) => {
      return category.symbols.map((name) => {
        return symbolKey(category.specifier, name);
      });
    })
  );

  const consumed = new Set<string>();

  const categories: ApiCategory[] = CATEGORIES.map((category) => {
    const ctx: PrintContext = {
      resolve: (name) => {
        const own = symbolKey(category.specifier, name);
        if (pageOf.has(own)) {
          return own;
        }
        const core = symbolKey(CORE, name);
        return pageOf.has(core) ? core : undefined;
      },
      warn,
      names,
    };
    return {
      id: category.id,
      label: category.label,
      specifier: category.specifier,
      blurb: category.blurb,
      symbols: category.symbols.map((name) => {
        const declaration = declarationFor(category.specifier, name);
        if (declaration === undefined) {
          throw new Error(
            `[antumbra-api] category "${category.id}" lists "${name}", which "${category.specifier}" does not export.`
          );
        }
        consumed.add(symbolKey(declaration.specifier, name));
        // Keyed by page, not declaration site: each binding's copy is its own link target.
        const symbol = toSymbol(declaration.node, {
          ...ctx,
          specifier: category.specifier,
          category: category.id,
        });
        if (symbol === null) {
          throw new Error(
            `[antumbra-api] "${symbolKey(category.specifier, name)}" has no renderable kind.`
          );
        }
        return symbol;
      }),
    };
  });

  const orphans = [...declarations.keys()].filter((key) => {
    return !consumed.has(key);
  });
  if (orphans.length > 0) {
    throw new Error(
      `[antumbra-api] ${String(orphans.length)} export(s) belong to no category and would be ` +
        `unreachable in the reference: ${orphans.join(', ')}. Add them to CATEGORIES in ` +
        `playground/vite-plugins/api-model.ts.`
    );
  }

  return categories;
}

export function apiModelPlugin(): Plugin {
  const repoRoot = resolve(import.meta.dirname, '..', '..');
  const cacheDir = join(repoRoot, 'node_modules', '.cache', 'antumbra-api');
  const watched = join(repoRoot, 'src');
  let pending: Promise<string> | null = null;

  const generate = async (warn: (message: string) => void): Promise<string> => {
    const seen = new Set<string>();
    return JSON.stringify(
      await buildModel(repoRoot, {
        cacheDir,
        warn: (message) => {
          // Once per distinct message: an unhandled type kind repeats across every symbol.
          if (!seen.has(message)) {
            seen.add(message);
            warn(message);
          }
        },
      })
    );
  };

  return {
    name: 'antumbra:api-model',

    // Started here and awaited in `load`, so typedoc runs alongside the rest of the graph rather
    // than in the middle of it. Deliberately not returned: Rolldown awaits `buildStart` before it
    // scans a module, so returning the promise would re-serialise exactly what this parallelises.
    // In dev this warms the model at startup instead of on the first visit to `/api`, which is the
    // same trade `server.warmup` makes.
    buildStart() {
      pending ??= generate((message) => {
        this.warn(message);
      });
      // The rejection is handled where it is awaited; this only keeps Node from seeing it unhandled.
      pending.catch(() => {
        return undefined;
      });
    },

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },

    async load(id) {
      if (id !== RESOLVED_ID) {
        return null;
      }
      // Not only `buildStart`'s: the dev server drops `pending` on a change under `src/`.
      pending ??= generate((message) => {
        this.warn(message);
      });
      // `JSON.parse` of a string literal, not the object literal: ~215 kB parses as data in one
      // pass where the same bytes as JavaScript go through the full parser.
      return `export default JSON.parse(${JSON.stringify(await pending)});`;
    },

    configureServer(server) {
      // Vite does not watch `src` on behalf of a virtual module, so re-generate and let HMR push it.
      server.watcher.add(watched);
      server.watcher.on('change', (file) => {
        if (!file.startsWith(watched)) {
          return;
        }
        pending = null;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
  };
}
