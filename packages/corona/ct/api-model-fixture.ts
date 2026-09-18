import type { ApiCategory } from '../src/api/contract.ts';

/**
 * A generated model, small enough to reason about and shaped like a real one.
 *
 * The viewer's own rules are about *collisions and neighbours*, so the fixture is built to have
 * both: `useDialog` is exported by three specifiers, which is exactly why a symbol's identity is
 * `specifier#name` and not a bare name. A one-library fixture would let that rule pass untested.
 */
export const MODEL: readonly ApiCategory[] = [
  {
    id: 'core',
    label: 'The core',
    specifier: 'lib',
    blurb: 'What works with no framework at all.',
    symbols: [
      {
        key: 'lib#createThing',
        name: 'createThing',
        kind: 'function',
        category: 'core',
        specifier: 'lib',
        signature: [{ text: 'function createThing(): ' }, { text: 'Thing', link: 'lib#Thing' }],
        summary: [{ text: 'Makes a thing.' }],
        remarks: [],
        see: [],
        examples: ['const thing = createThing();'],
        typeParams: [],
        params: [],
        returns: [{ text: 'the thing' }],
        members: [],
      },
      {
        key: 'lib#Thing',
        name: 'Thing',
        kind: 'type',
        category: 'core',
        specifier: 'lib',
        signature: [{ text: 'type Thing = { id: string }' }],
        summary: [{ text: 'The thing itself.' }],
        remarks: [],
        see: [],
        examples: [],
        typeParams: [],
        params: [],
        returns: [],
        members: [
          {
            name: 'id',
            summary: 'What it is called.',
            type: [{ text: 'string' }],
            optional: false,
          },
        ],
      },
      {
        key: 'lib#useDialog',
        name: 'useDialog',
        kind: 'function',
        category: 'core',
        specifier: 'lib',
        signature: [{ text: 'function useDialog(): void' }],
        summary: [{ text: 'The core one.' }],
        remarks: [],
        see: [],
        examples: [],
        typeParams: [],
        params: [],
        returns: [],
        members: [],
      },
    ],
  },
  {
    id: 'react',
    label: 'The React binding',
    specifier: 'lib/react',
    blurb: 'The same surface, for React.',
    symbols: [
      {
        key: 'lib/react#useDialog',
        name: 'useDialog',
        kind: 'function',
        category: 'react',
        specifier: 'lib/react',
        signature: [{ text: 'function useDialog(): void' }],
        summary: [{ text: 'The React one — a different declaration under the same name.' }],
        remarks: [],
        see: [],
        examples: [],
        typeParams: [],
        params: [],
        returns: [],
        members: [],
      },
    ],
  },
  {
    id: 'solid',
    label: 'The Solid binding',
    specifier: 'lib/solid',
    blurb: 'And for Solid.',
    symbols: [
      {
        key: 'lib/solid#useDialog',
        name: 'useDialog',
        kind: 'function',
        category: 'solid',
        specifier: 'lib/solid',
        signature: [{ text: 'function useDialog(): void' }],
        summary: [{ text: 'The Solid one.' }],
        remarks: [],
        see: [],
        examples: [],
        typeParams: [],
        params: [],
        returns: [],
        members: [],
      },
    ],
  },
];

export default MODEL;
