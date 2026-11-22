# lerno-docs

The documentation site for [Lerno](https://github.com/trymedu/lerno): Next.js and Fumadocs, English
by default with a Turkish mirror under `/tr`. It is deployed on Vercel at
https://lernodocs.vercel.app.

The engine lives in a separate repository and is checked out here as the `vendor/lerno` submodule.
Its packages are linked through the workspace, so the site always builds against the engine source.

## Develop

```bash
git submodule update --init --recursive
bun install
bun run dev
```

`dev` builds the engine packages from `vendor/lerno` and then starts Next.js.

## Build

```bash
bun run build
bun run start
bun run type-check
```

## Deploy

The Vercel project is connected to this repository. It runs `bun install` and `bun run build`, which
builds the engine packages before the site. The Worker serves the en/tr docs, the search endpoint at
`/api/search`, `llms.txt`, `llms-full.txt`, and the Markdown mirrors.

Production: https://lernodocs.vercel.app

## Environment

| Variable | Default | Used for |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `metadataBase`, `sitemap.xml`, `robots.txt`, canonical URLs |
| `NEXT_PUBLIC_REPO_URL` | `https://github.com/trymedu/lerno` | The GitHub link in the header |
| `NEXT_PUBLIC_DOCS_REPO_URL` | `https://github.com/trymedu/lerno-docs` | Edit and page action links |

Set `NEXT_PUBLIC_SITE_URL` to the public origin in every deployed environment; otherwise the sitemap
and canonical URLs point at localhost.

## Content

The writing rules are in [DOCS_STANDARD.md](./DOCS_STANDARD.md): English files use no suffix,
Turkish files use `.tr.mdx`, and the frontmatter schema lives in `lib/source.ts`.
