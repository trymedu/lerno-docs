import { RootProvider } from 'fumadocs-ui/provider/next';
import { i18nProvider } from 'fumadocs-ui/i18n';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { siteUrl } from '@/lib/site';
import { translations } from '@/lib/layout.shared';
import '../global.css';
import 'katex/dist/katex.min.css';

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider i18n={i18nProvider(translations, lang)}>{children}</RootProvider>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Lerno',
    template: '%s · Lerno',
  },
  description:
    'Lerno — an open scene graph, reactive model and renderer-agnostic runtime for educational visualisation.',
  applicationName: 'Lerno',
  openGraph: {
    type: 'website',
    siteName: 'Lerno',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: '/',
    languages: {
      en: '/',
      tr: '/tr',
    },
  },
};

export const viewport: import('next').Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0B0F19' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
};
