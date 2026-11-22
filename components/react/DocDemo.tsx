'use client';

import type { ReactNode } from 'react';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { useDocsLang } from './use-docs-lang';

export interface DocDemoProps {
  /** Source of the sample, highlighted on the Source tab. */
  source?: string;
  /** Kaynak kodun dili. */
  lang?: string;
  /** `Node.toRender()` output; enables the JSON tab. */
  json?: string;
  /** Live preview. */
  children?: ReactNode;
  /** Tab labels; the JSON tab is added when `json` is provided. */
  items?: string[];
}

/**
 * Panel that shows source and live output side by side.
 *
 * Carries three tabs: `Preview` is the live output, `Code` builds it,
 * `JSON` is the plain `toRender()` data. Source and JSON are independent:
 * only the provided parts are drawn.
 */
export function DocDemo({ source, lang = 'tsx', json, children, items }: DocDemoProps) {
  const locale = useDocsLang();
  const preview = locale === 'tr' ? 'Önizleme' : 'Preview';
  const code = locale === 'tr' ? 'Kod' : 'Code';
  const tabs = items ?? (json ? [preview, code, 'JSON'] : [preview, code]);
  const showPreview = Boolean(children);
  const showSource = Boolean(source);
  const showJson = Boolean(json);

  if (tabs.length === 3 && showPreview && showSource && showJson) {
    return (
      <Tabs items={tabs}>
        <Tab>{children}</Tab>
        <Tab>
          <DynamicCodeBlock lang={lang} code={source ?? ''} />
        </Tab>
        <Tab>
          <DynamicCodeBlock lang="json" code={json ?? '{}'} />
        </Tab>
      </Tabs>
    );
  }

  return (
    <Tabs items={showSource ? [preview, code] : tabs.slice(0, 1)}>
      <Tab>{children}</Tab>
      {showSource ? (
        <Tab>
          <DynamicCodeBlock lang={lang} code={source ?? ''} />
        </Tab>
      ) : null}
    </Tabs>
  );
}
