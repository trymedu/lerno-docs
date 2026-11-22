import defaultMdxComponents from 'fumadocs-ui/mdx';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import type { MDXComponents } from 'mdx/types';

/**
 * Component set available to MDX pages.
 *
 * `TypeTable` is used for API property and method tables;
 * usable without a page-level import.
 *
 * @param components - Extra components for the page.
 * @returns The merged component map.
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    TypeTable,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
