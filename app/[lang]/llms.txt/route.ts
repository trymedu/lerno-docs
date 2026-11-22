import { docsLlms } from '@/lib/source';

export const revalidate = false;

/**
 * LLM index for a non-default locale.
 *
 * The default language is served by `app/llms.txt`; every other locale, including
 * English, is served from this segment so `/en/llms.txt` resolves.
 *
 * @param _req - Incoming request; the locale comes from the route segment.
 * @param params - Route parameters carrying the language code.
 * @returns The localized `llms.txt` index as plain text.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  return new Response(await docsLlms.index(lang), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
