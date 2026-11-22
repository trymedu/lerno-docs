import type { Metadata } from 'next';
import { MotionSample } from '@/components/react/MotionSample';
import { hideInProduction } from '@/lib/dev-only';

/**
 * Hidden page: the longer reference render for the lerno-motion skill.
 * Opened by direct link only; not in navigation and not indexed.
 */
export const metadata: Metadata = {
  title: 'Hareket · Bir andaki hız',
  description: 'lerno-motion skill’iyle üretilmiş 19 saniyelik sahne: ortalama hızdan anlık hıza.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default async function InstantaneousSpeedPage({ params }: { params: Promise<{ lang: string }> }) {
  hideInProduction();
  const { lang } = await params;
  const skillHref = lang === 'en' ? '/docs/ai/skills/motion' : `/${lang}/docs/ai/skills/motion`;

  return (
    <MotionSample
      skillHref={skillHref}
      kicker="lerno-motion"
      title="Bir andaki hız"
      description="Yirmi saniyeye yakın, dört bölümlü bir sahne. Konum eğrisi çizilir, iki nokta arasındaki ortalama hız hesaplanır, aralık daraldıkça sekant teğete dönüşür ve teğet eğri boyunca ilerleyerek hızın her anda değiştiğini gösterir."
      scene="speed"
      exportPath="/media/motion/instantaneous-speed.mp4"
      stats={[
        { label: 'Süre', value: '19 sn' },
        { label: 'Çözünürlük', value: '1280×720' },
        { label: 'Kare hızı', value: '30 fps' },
        { label: 'Dosya', value: '154 KB' },
        { label: 'Render', value: '1,3 sn' },
      ]}
      beats={[
        { time: '1,0 sn', label: 'Eğri kendini çizer', src: '/media/motion/instantaneous-speed.frames/beat-01-1.00s.png' },
        { time: '3,3 sn', label: 'P ve Q noktaları, ortalama hız 5,00', src: '/media/motion/instantaneous-speed.frames/beat-02-3.30s.png' },
        { time: '5,4 sn', label: 'Aralık daralıyor, h 0,52 s', src: '/media/motion/instantaneous-speed.frames/beat-03-5.40s.png' },
        { time: '8,6 sn', label: 'Sekant teğete dönüştü, v 4,00', src: '/media/motion/instantaneous-speed.frames/beat-04-8.60s.png' },
        { time: '12,5 sn', label: 'Teğet eğri boyunca ilerliyor', src: '/media/motion/instantaneous-speed.frames/beat-05-12.50s.png' },
        { time: '17,5 sn', label: 'Sonuç satırı, çerçeve sabit', src: '/media/motion/instantaneous-speed.frames/beat-06-17.50s.png' },
      ]}
      notes={{
        title: 'Bölümleri birbirine bağlayan dört karar',
        items: [
          'Ortalama hız ile anlık hız aynı okuma alanında gösterilir; aralık daraldıkça yalnızca sayı ve çizgi değişir, yerleşim kaymaz.',
          'Sekant kesikli ve nötr, teğet düz ve vurgu rengindedir. Renk değişimi aralığın sıfıra indiği anda gerçekleşir.',
          'Teğet 10. saniyede eğri boyunca ilerlemeye başlar; hızın sabit olmadığı böylece tek bir karede değil, hareketle anlatılır.',
          'Son 2,5 saniye hareketsizdir. Uzun sahnede de bitiş, hareketin durmasıyla kurulur.',
        ],
      }}
      scenePath="apps/lerno-docs/scenes/instantaneous-speed.ts"
    />
  );
}
