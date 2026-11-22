import { docs, source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getMDXComponents } from '@/components/mdx';
import { getPageMarkdownUrl } from '@/lib/shared';

export default async function Page({ params }: { params: Promise<{ lang: string; slug?: string[] }> }) {
  const { lang, slug } = await params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  const entry = docs.getPage(page.path);
  if (!entry) notFound();

  const MDX = entry.body;
  const markdownUrl = getPageMarkdownUrl(page).url;

  return (
    <DocsPage toc={entry.toc} full={entry.full}>
      <DocsTitle>{entry.title}</DocsTitle>
      <DocsDescription className="mb-0">{entry.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug?: string[] }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
