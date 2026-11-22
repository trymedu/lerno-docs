import { notFound } from 'next/navigation';
import { docsLlms, source } from '@/lib/source';
import { getPageMarkdownUrl } from '@/lib/shared';

export const revalidate = false;

/**
 * Markdown of a single page for a non-default locale, for AI agents.
 *
 * `getPageMarkdownUrl` appends `content.md` and prefixes the locale, so English
 * pages resolve to `/en/llms.mdx/docs/...` and are served from here.
 *
 * @param _req - Incoming request.
 * @param params - Route parameters carrying the language code and the slug.
 * @returns The rendered page as `text/markdown`.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ lang: string; slug?: string[] }> }) {
  const { lang, slug } = await params;
  const slugs = slug?.slice(0, -1) ?? [];
  if (slugs.at(-1) === 'index') slugs.pop();

  const page = source.getPage(slugs, lang);
  if (!page) notFound();

  return new Response(await docsLlms.page(page), {
    headers: { 'Content-Type': 'text/markdown' },
  });
}

/**
 * Pre-renders every localized page for this route.
 *
 * @returns One entry per page with its language and slug segments.
 */
export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageMarkdownUrl(page).segments,
  }));
}
