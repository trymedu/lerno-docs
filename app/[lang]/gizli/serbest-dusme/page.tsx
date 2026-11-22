import type { Metadata } from 'next';
import { LernoFreeFallScene } from '@/components/react/LernoFreeFallScene';
import { hideInProduction } from '@/lib/dev-only';

/**
 * Hidden page: free-fall lesson built from scratch as a Lerno scene.
 * No video file; time, scene, and controls come from Lerno.
 */
export const metadata: Metadata = {
  title: 'Serbest Düşme · Lerno Sahnesi',
  description: 'MEBİ videosundan esinlenen, tamamen Lerno sahne grafiğiyle üretilmiş etkileşimli ders.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function HiddenFreeFallPage() {
  hideInProduction();

  return <LernoFreeFallScene />;
}
