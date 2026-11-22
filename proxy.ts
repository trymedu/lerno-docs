import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { i18n } from '@/lib/i18n';
import { docsContentRoute, docsRoute } from '@/lib/shared';

/**
 * Docs routes paired with the prefix their content route needs.
 *
 * The default language carries no URL prefix, so `/docs` rewrites to
 * `${docsContentRoute}/…` while `/tr/docs` must rewrite to `/tr${docsContentRoute}/…`.
 * Without the second half, Markdown negotiation works for English only and
 * silently serves English content for every other locale.
 */
const docsRoutes = [
  { prefix: '', route: docsRoute },
  ...i18n.languages
    .filter((locale) => locale !== i18n.defaultLanguage)
    .map((locale) => ({ prefix: `/${locale}`, route: `/${locale}${docsRoute}` })),
];

/** Rewrites `/docs/x.md` (and its locale variant) to the Markdown content route. */
const suffixRewrites = docsRoutes.map(({ prefix, route }) =>
  rewritePath(`${route}{/*path}.md`, `${prefix}${docsContentRoute}{/*path}/content.md`),
);

/** Rewrites `/docs/x` when the client prefers Markdown. */
const markdownRewrites = docsRoutes.map(({ prefix, route }) =>
  rewritePath(`${route}{/*path}`, `${prefix}${docsContentRoute}{/*path}/content.md`),
);

const i18nMiddleware = createI18nMiddleware(i18n);

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname;

  for (const rule of suffixRewrites) {
    const rewritten = rule.rewrite(pathname);
    if (rewritten) {
      return NextResponse.rewrite(new URL(rewritten, request.nextUrl));
    }
  }

  // Static assets are served straight from `public/` and carry no locale segment.
  // Running the i18n rewrite over them would produce `/en/media/...`, a path with
  // no route behind it, and the file would 404.
  if (/\.[a-z0-9]+$/i.test(pathname)) {
    return NextResponse.next();
  }

  if (isMarkdownPreferred(request)) {
    for (const rule of markdownRewrites) {
      const preferred = rule.rewrite(pathname);
      if (preferred) {
        return NextResponse.rewrite(new URL(preferred, request.nextUrl), {
          headers: { Vary: 'Accept' },
        });
      }
    }
  }

  return i18nMiddleware(request, event);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|llms).*)'],
};
