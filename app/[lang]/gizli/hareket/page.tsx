import type { Metadata } from 'next';
import { MotionSample } from '@/components/react/MotionSample';
import { hideInProduction } from '@/lib/dev-only';

/**
 * Hidden page: the short reference render for the lerno-motion skill.
 * Opened by direct link only; not in navigation and not indexed.
 */
export const metadata: Metadata = {
  title: 'Hareket · Bir atış ve bir düşüş',
  description: 'lerno-motion skill’iyle üretilmiş 5,8 saniyelik referans sahne.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default async function MotionSamplePage({ params }: { params: Promise<{ lang: string }> }) {
  hideInProduction();
  const { lang } = await params;
  const skillHref = lang === 'en' ? '/docs/ai/skills/motion' : `/${lang}/docs/ai/skills/motion`;

  return (
    <MotionSample
      skillHref={skillHref}
      kicker="lerno-motion"
      title="Bir atış ve bir düşüş"
      description="Yatay hızın düşme süresini değiştirmediğini anlatan tek fikirli bir sahne. Skill’in istediği sırayla üretildi: vuruş tablosu, tek vurgu rengi, her varışta durma, sonra kare denetimi."
      scene="throw"
      exportPath="/media/motion/horizontal-throw.mp4"
      stats={[
        { label: 'Süre', value: '5,8 sn' },
        { label: 'Çözünürlük', value: '1280×720' },
        { label: 'Kare hızı', value: '30 fps' },
        { label: 'Dosya', value: '37 KB' },
      ]}
      beats={[
        { time: '0,8 sn', label: 'İki top raf üzerinde durur', src: '/media/motion/horizontal-throw.frames/beat-01-0.80s.png' },
        { time: '2,6 sn', label: 'Bırakıldıktan sonra birlikte düşer', src: '/media/motion/horizontal-throw.frames/beat-02-2.60s.png' },
        { time: '3,6 sn', label: 'Aynı anda yere ulaşır', src: '/media/motion/horizontal-throw.frames/beat-03-3.60s.png' },
        { time: '4,6 sn', label: 'Sonuç satırı, çerçeve sabit', src: '/media/motion/horizontal-throw.frames/beat-04-4.60s.png' },
      ]}
      notes={{
        title: 'Sahneyi kuran üç karar',
        items: [
          'Tek vurgu rengi yalnızca atılan topa ve ona ait işaretlere ayrıldı; düşen top nötr kaldı.',
          'Kesikli çizgi iki topu düşme boyunca birleştirir, böylece aynı yükseklikte oldukları metin okunmadan görülür.',
          'Son 1,9 saniye hareketsizdir. Video bu yüzden kesilmiş değil, bitmiş görünür.',
        ],
      }}
      scenePath="apps/lerno-docs/scenes/horizontal-throw.ts"
    />
  );
}
