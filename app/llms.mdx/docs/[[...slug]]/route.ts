import { notFound } from 'next/navigation';
import { docsLlms, source } from '@/lib/source';
import { getPageMarkdownUrl } from '@/lib/shared';

export const revalidate = false;

/**
 * Markdown of a single page for the default locale, for AI agents.
 *
 * Localized pages resolve to `/[lang]/llms.mdx/docs/...` and are served from
 * the route under `app/[lang]`.
 *
 * @param _req - Incoming request.
 * @param params - Route parameters carrying the slug.
 * @returns The rendered page as `text/markdown`.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const page = source.getPage(slug?.slice(0, -1));
  if (!page) notFound();

  return new Response(await docsLlms.page(page), {
    headers: {
      'Content-Type': 'text/markdown',
    },
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageMarkdownUrl(page).segments,
  }));
}
