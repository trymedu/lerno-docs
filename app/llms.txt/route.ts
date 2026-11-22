import { docsLlms } from '@/lib/source';
import { i18n } from '@/lib/i18n';

export const revalidate = false;

/**
 * LLM index for the default locale.
 *
 * Other locales are served by `app/[lang]/llms.txt`, so this route only handles
 * language-less requests such as `/llms.txt`.
 *
 * @returns The `llms.txt` index as plain text.
 */
export async function GET() {
  // index() with no language returns every locale concatenated; pin the default.
  return new Response(await docsLlms.index(i18n.defaultLanguage), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
