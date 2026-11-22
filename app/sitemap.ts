import type { MetadataRoute } from 'next';
import { i18n } from '@/lib/i18n';
import { localizedDocsUrl } from '@/lib/shared';
import { siteUrl } from '@/lib/site';
import { source } from '@/lib/source';

/**
 * Both home pages plus every documented page in every locale. The `gizli`
 * prototypes are development-only and stay out of the index.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const home = i18n.languages.map((lang) => ({
    url: `${siteUrl}${lang === i18n.defaultLanguage ? '' : `/${lang}`}`,
    changeFrequency: 'monthly' as const,
    priority: lang === i18n.defaultLanguage ? 1 : 0.9,
  }));

  const pages = source.generateParams().map(({ lang, slug }) => ({
    url: `${siteUrl}${localizedDocsUrl(lang, slug)}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...home, ...pages];
}
