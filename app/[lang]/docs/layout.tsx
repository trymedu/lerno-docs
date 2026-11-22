import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { i18n } from '@/lib/i18n';
import { baseOptions } from '@/lib/layout.shared';
import type { ReactNode } from 'react';

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;
  const docs = lang === i18n.defaultLanguage ? '/docs' : `/${lang}/docs`;
  const tabs =
    lang === 'tr'
      ? [
          { title: 'Lerno', description: 'Açık sahne grafiği ve reaktif model çalışma zamanı.', url: docs },
          { title: 'Lerno React', description: 'SVG bileşenleri, laboratuvarlar ve oynatıcı.', url: `${docs}/react` },
        ]
      : [
          { title: 'Lerno', description: 'Open scene graph and reactive model runtime.', url: docs },
          { title: 'Lerno React', description: 'SVG components, labs, and the player.', url: `${docs}/react` },
        ];

  return (
    <DocsLayout
      tree={source.getPageTree(lang)}
      tabs={tabs}
      {...baseOptions(lang)}
    >
      {children}
    </DocsLayout>
  );
}
