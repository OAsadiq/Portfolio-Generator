import { useEffect } from 'react';

interface SeoOptions {
  title: string;
  description: string;
  /** Absolute canonical URL, e.g. https://porfilr.com/portfolio-website-for-graphic-designers */
  canonical: string;
  /** Optional JSON-LD object(s) injected as <script type="application/ld+json">. */
  jsonLd?: object | object[];
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Per-page SEO for this SPA: sets <title>, description, canonical, OG/Twitter tags,
 * and optional JSON-LD. Cleans up the JSON-LD it injects on unmount so pages don't
 * accumulate stale structured data as the user navigates.
 */
export function useSeo({ title, description, canonical, jsonLd }: SeoOptions) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);

    let linkEl = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!linkEl) {
      linkEl = document.createElement('link');
      linkEl.setAttribute('rel', 'canonical');
      document.head.appendChild(linkEl);
    }
    const prevCanonical = linkEl.getAttribute('href');
    linkEl.setAttribute('href', canonical);

    const scripts: HTMLScriptElement[] = [];
    if (jsonLd) {
      const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      blocks.forEach(block => {
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.textContent = JSON.stringify(block);
        document.head.appendChild(s);
        scripts.push(s);
      });
    }

    return () => {
      document.title = prevTitle;
      if (prevCanonical) linkEl!.setAttribute('href', prevCanonical);
      scripts.forEach(s => s.remove());
    };
  }, [title, description, canonical, jsonLd]);
}
