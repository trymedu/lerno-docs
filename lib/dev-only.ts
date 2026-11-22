import { notFound } from 'next/navigation';

/**
 * `gizli` (hidden) pages are internal previews of the motion work: reachable in
 * development, a 404 in a production build. They stay in the tree so the team
 * keeps a rendering target without shipping it to the public site.
 */
export function hideInProduction(): void {
  if (process.env.NODE_ENV === 'production') notFound();
}
