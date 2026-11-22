import { createGetUrl } from 'fumadocs-core/source';
import { i18n } from './i18n';

export const appName = 'Lerno';
export const docsRoute = '/docs';
export const docsContentRoute = '/llms.mdx/docs';

const getContentUrl = createGetUrl(docsContentRoute, i18n);

/** Docs URL for a locale and slug list: `/docs/react` or `/tr/docs/react`. */
export function localizedDocsUrl(lang: string, slugs: readonly string[] = []): string {
  const prefix = lang === i18n.defaultLanguage ? '' : `/${lang}`;

  return `${prefix}${[docsRoute, ...slugs].join('/')}`;
}

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}
