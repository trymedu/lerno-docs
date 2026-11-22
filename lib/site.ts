/**
 * Canonical public addresses of the project.
 *
 * Both are overridable at build time so the same source deploys to a preview, a
 * staging domain and production without touching code.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export const repoUrl = process.env.NEXT_PUBLIC_REPO_URL ?? 'https://github.com/trymedu/lerno';

export const repoName = 'trymedu/lerno';

export const docsRepoUrl = process.env.NEXT_PUBLIC_DOCS_REPO_URL ?? 'https://github.com/trymedu/lerno-docs';
