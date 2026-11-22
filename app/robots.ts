import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

/**
 * Crawler rules. `/llms.mdx` is the Markdown mirror of every page: it is meant
 * for language models, not for the index, and `/gizli` only exists in
 * development.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/llms.mdx/', '/en/llms.mdx/', '/tr/llms.mdx/', '/gizli/', '/en/gizli/', '/tr/gizli/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
