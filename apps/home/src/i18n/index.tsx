import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import en from './translations/en/common.json' with { type: 'json' };
import fr from './translations/fr/common.json' with { type: 'json' };

/**
 * Two languages, twenty-one strings, one page, and no message format in any of them.
 *
 * This was `i18next` + `react-i18next` + `i18next-browser-languagedetector` and 160 lines of local
 * code around them — including an 82-line helper whose only reason to exist was that `i18next`
 * initialises asynchronously, so the language switch had to hand a promise to an event handler.
 * Nothing here is asynchronous, so none of that is needed.
 *
 * What the libraries were carrying that this does not: plurals, interpolation, namespaces, lazy
 * bundles and a fallback chain. The strings had exactly one `{{interpolation}}` and it belonged to
 * a page that no longer exists. When one of those is wanted again, take the library back — it is a
 * better library than this is a file.
 */

/** The French bundle is typed against the English one, so a key that drifts fails to compile. */
const BUNDLES = { en, fr: fr satisfies typeof en } as const;

export type Language = keyof typeof BUNDLES;

/**
 * Every dotted path in the bundle, as a union.
 *
 * `t` took a `string` before, so `t('home.nmae')` compiled and rendered the key to the page. It
 * does not compile now, which is the whole reason this is typed rather than a `Record`.
 */
type Paths<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}`;
    }[keyof T & string];

export type TranslationKey = Paths<typeof en>;

/**
 * The tag on `<html lang>`, and the only place any of them is written.
 *
 * Three values were in play for two languages: `index.html` declares `en-CA`, an effect in `App`
 * wrote `i18n.language` (`en`), and the switch wrote `en-CA`/`fr-CA` — so the attribute said `en`
 * after a load and `fr-CA` after a toggle, for the same page in the same language.
 */
const TAGS = { en: 'en-CA', fr: 'fr-CA' } as const;

const STORAGE_KEY = 'language';
const DEFAULT: Language = 'en';

function isLanguage(value: string | null): value is Language {
  return value !== null && value in BUNDLES;
}

/** What the visitor asked for, in the order their answers are worth: a choice, then a preference. */
function detect(): Language {
  try {
    const chosen = localStorage.getItem(STORAGE_KEY);
    if (isLanguage(chosen)) {
      return chosen;
    }
  } catch {
    // A private window can refuse storage. A refused preference is not an error, it is a default.
  }
  for (const tag of navigator.languages) {
    const base = tag.split('-')[0];
    if (isLanguage(base ?? null)) {
      return base as Language;
    }
  }
  return DEFAULT;
}

function read(bundle: (typeof BUNDLES)[Language], key: string): string {
  let node: unknown = bundle;
  for (const part of key.split('.')) {
    node =
      typeof node === 'object' && node !== null
        ? (node as Record<string, unknown>)[part]
        : undefined;
  }
  // The type makes this unreachable for a declared key; it is here so a bundle that lost one
  // renders its name rather than `undefined`, which is what a reader can report.
  return typeof node === 'string' ? node : key;
}

type Translation = {
  readonly language: Language;
  readonly t: (key: TranslationKey) => string;
  readonly setLanguage: (language: Language) => void;
};

const TranslationContext = createContext<Translation | null>(null);

export function TranslationProvider({ children }: { readonly children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detect);

  useEffect(() => {
    document.documentElement.lang = TAGS[language];
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The choice still holds for this visit; only its memory is refused.
    }
  }, []);

  const value = useMemo<Translation>(() => {
    return {
      language,
      setLanguage,
      t: (key) => {
        return read(BUNDLES[language], key);
      },
    };
  }, [language, setLanguage]);

  return <TranslationContext value={value}>{children}</TranslationContext>;
}

export function useTranslation(): Translation {
  const value = useContext(TranslationContext);
  if (value === null) {
    throw new Error('useTranslation was called outside a <TranslationProvider>.');
  }
  return value;
}
