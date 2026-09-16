/**
 * @fileoverview useDocumentHead - Modern React 19 hook for managing document head
 *
 * Replaces react-helmet-async with native DOM manipulation for SPA without SSR.
 * Automatically updates document.title and meta tags based on configuration.
 */

import { useEffect } from "react";

/**
 * Configuration for document head elements
 */
export type DocumentHeadConfig = {
  /** Page title (sets document.title) */
  title?: string;
  /** Meta description tag */
  description?: string;
  /** Meta keywords tag */
  keywords?: string;
  /** Open Graph title */
  ogTitle?: string;
  /** Open Graph description */
  ogDescription?: string;
  /** Open Graph image URL */
  ogImage?: string;
  /** Open Graph type (default: "website") */
  ogType?: string;
  /** Canonical URL */
  canonical?: string;
};

/**
 * Hook to manage document head (title and meta tags)
 *
 * Updates document.title and creates/updates meta tags based on configuration.
 * Automatically cleans up created tags on unmount.
 *
 * @param config - Document head configuration
 *
 * @example
 * ```tsx
 * function AboutPage() {
 *   useDocumentHead({
 *     title: 'À propos - Francis Desjardins',
 *     description: 'Développeur full-stack spécialisé en React et TypeScript',
 *     keywords: 'react, typescript, développeur',
 *     ogTitle: 'À propos de Francis',
 *     ogImage: '/images/about-og.png',
 *   });
 *
 *   return <div>About content...</div>;
 * }
 * ```
 */
export function useDocumentHead(config: DocumentHeadConfig): void {
  useEffect(() => {
    // Update document title
    if (config.title) {
      document.title = config.title;
    }

    const createdTags: HTMLElement[] = [];

    // Meta tag configuration mapping
    const metaConfig: Array<{
      attribute: "name" | "property";
      key: string;
      content: string | undefined;
    }> = [
      { attribute: "name", key: "description", content: config.description },
      { attribute: "name", key: "keywords", content: config.keywords },
      { attribute: "property", key: "og:title", content: config.ogTitle },
      { attribute: "property", key: "og:description", content: config.ogDescription },
      { attribute: "property", key: "og:image", content: config.ogImage },
      { attribute: "property", key: "og:type", content: config.ogType },
    ];

    // Create or update meta tags
    metaConfig.forEach(({ attribute, key, content }) => {
      if (!content) {
        return;
      }

      // Try to find existing tag
      let tag = document.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement;

      if (!tag) {
        // Create new tag if it doesn't exist
        tag = document.createElement("meta");
        tag.setAttribute(attribute, key);
        document.head.appendChild(tag);
        createdTags.push(tag);
      }

      // Update content
      tag.content = content;
    });

    // Handle canonical link
    if (config.canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.rel = "canonical";
        document.head.appendChild(canonicalLink);
        createdTags.push(canonicalLink);
      }

      canonicalLink.href = config.canonical;
    }

    // Cleanup: remove created tags on unmount
    return () => {
      createdTags.forEach((tag) => {
        if (tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });
    };
  }, [
    config.title,
    config.description,
    config.keywords,
    config.ogTitle,
    config.ogDescription,
    config.ogImage,
    config.ogType,
    config.canonical,
  ]);
}

/**
 * Simple hook to update only the document title
 *
 * @param title - Page title
 *
 * @example
 * ```tsx
 * function HomePage() {
 *   useDocumentTitle('Accueil - Francis Desjardins');
 *   return <div>Home content...</div>;
 * }
 * ```
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
