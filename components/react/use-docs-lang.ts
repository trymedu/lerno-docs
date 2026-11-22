'use client';

import { usePathname } from 'next/navigation';

/**
 * Documentation language from the URL. English is served without a prefix,
 * Turkish under `/tr`.
 */
export function useDocsLang(): 'tr' | 'en' {
  const pathname = usePathname();
  return pathname === '/tr' || pathname?.startsWith('/tr/') ? 'tr' : 'en';
}
