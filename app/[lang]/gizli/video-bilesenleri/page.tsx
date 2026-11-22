import type { Metadata } from 'next';
import { LayeredVideoDemo } from '@/components/react/LayeredVideoDemo';
import { hideInProduction } from '@/lib/dev-only';

/**
 * Hidden pilot: manifest-driven interaction layers.
 * Opened by direct link only; not in navigation and not indexed.
 */
export const metadata: Metadata = {
  title: 'Serbest Düşme · Bileşen Katmanı',
  description: 'Lerno etkileşimli video component pilotu.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function LayeredVideoPage() {
  hideInProduction();

  return <LayeredVideoDemo />;
}
