import { docsLlms } from '@/lib/source';
import { i18n } from '@/lib/i18n';

export const revalidate = false;

/**
 * Single-file Markdown dump of every page for the default locale.
 *
 * Other locales are served by `app/[lang]/llms-full.txt`.
 *
 * @returns Every page rendered by `renderPage`, joined into one document.
 */
export async function GET() {
  // full() with no language concatenates every locale; pin the default.
  return new Response(await docsLlms.full(i18n.defaultLanguage), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
