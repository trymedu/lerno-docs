import { docsLlms } from '@/lib/source';

export const revalidate = false;

/**
 * Single-file Markdown dump of every page for a non-default locale.
 *
 * The default language is served by `app/llms-full.txt`; other locales resolve
 * here, for example `/en/llms-full.txt`.
 *
 * @param _req - Incoming request; the locale comes from the route segment.
 * @param params - Route parameters carrying the language code.
 * @returns Every page rendered by `renderPage`, joined into one document.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  return new Response(await docsLlms.full(lang), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
