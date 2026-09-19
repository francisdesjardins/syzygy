/**
 * Mutate a copy, get a new object back, and keep everything you did not touch.
 *
 * This is the small half of what immer does, written out: a `Proxy` records writes against a
 * lazily-made copy, and a branch nobody wrote to comes back as the same object it went in as. That
 * last property is the whole point — it is what lets a memo or a `===` upstream skip a subtree.
 *
 * **What it does not do**, because nothing here needs it: `Map`, `Set`, `Date`, class instances,
 * frozen input, or a recipe that returns a value instead of mutating. Those are the parts of immer
 * that are worth its size, and the day one is wanted, take immer back.
 */

/**
 * The untyped boundary this file is built on, and the four `as` casts are all of it.
 *
 * A `Proxy` has the type of its target and cannot be told it behaves like something else, and the
 * internals walk a tree whose shape is only known at each step — so the outside is typed
 * (`produce<T>(base: T, recipe: (draft: T) => void): T`) and the inside works in `Plain`. Every
 * cast crosses that one line; a fifth somewhere else would be a different claim.
 */
type Plain = Record<PropertyKey, unknown>;

type Node = {
  readonly base: Plain;
  copy: Plain | null;
  readonly parent: Node | null;
  readonly key: PropertyKey;
  /** One proxy per key, so `d.a.b = 1; d.a.c = 2` writes into one copy rather than two. */
  readonly children: Map<PropertyKey, unknown>;
};

/** Plain objects and arrays are drafted; everything else is handed over as it is. */
function isDraftable(value: unknown): value is Plain {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * The copy for this node, made on first write and linked into its parent's.
 *
 * Walking up is what makes a nested write produce new objects the whole way to the root: a parent
 * that is still pointing at the original child would hand back a tree where the change is invisible.
 */
function ensureCopy(node: Node): Plain {
  if (node.copy !== null) {
    return node.copy;
  }
  const made: Plain = Array.isArray(node.base)
    ? ([...node.base] as unknown as Plain)
    : { ...node.base };
  node.copy = made;
  if (node.parent !== null) {
    ensureCopy(node.parent)[node.key] = made;
  }
  return made;
}

function current(node: Node): Plain {
  return node.copy ?? node.base;
}

function draft(node: Node): unknown {
  return new Proxy(node.base, {
    get(_target, key) {
      const value = current(node)[key];
      if (!isDraftable(value)) {
        return value;
      }
      const existing = node.children.get(key);
      if (existing !== undefined) {
        return existing;
      }
      const child = draft({ base: value, copy: null, parent: node, key, children: new Map() });
      node.children.set(key, child);
      return child;
    },
    // oxlint-disable-next-line max-params -- a `Proxy` trap's arity is the language's, not ours.
    set(_target, key, value) {
      ensureCopy(node)[key] = value;
      // The child proxy, if there is one, is now drafting an object this key no longer holds.
      node.children.delete(key);
      return true;
    },
    deleteProperty(_target, key) {
      // Deleting the key it was handed is the whole of what this trap is for; a static key would
      // mean it answered for one property.
      // oxlint-disable-next-line typescript/no-dynamic-delete -- see above
      delete ensureCopy(node)[key];
      node.children.delete(key);
      return true;
    },
    has(_target, key) {
      return key in current(node);
    },
    ownKeys() {
      return Reflect.ownKeys(current(node));
    },
    getOwnPropertyDescriptor(_target, key) {
      const descriptor = Reflect.getOwnPropertyDescriptor(current(node), key);
      // A proxy may not report a property as non-configurable when its target has no such property,
      // and the target here is the *base* while the answer comes from the copy.
      return descriptor === undefined ? undefined : { ...descriptor, configurable: true };
    },
  });
}

/** Run `recipe` against a draft of `base` and return what it produced. */
export function produce<T extends object>(base: T, recipe: (draft: T) => void): T {
  const root: Node = {
    base: base as unknown as Plain,
    copy: null,
    parent: null,
    key: '',
    children: new Map(),
  };
  recipe(draft(root) as T);
  return current(root) as unknown as T;
}
