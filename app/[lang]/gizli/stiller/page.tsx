import type { Metadata } from 'next';
import { hideInProduction } from '@/lib/dev-only';

/**
 * Hidden gallery: four 15-second pieces, one per style in the skill's catalog.
 * Opened by direct link only; not in navigation and not indexed.
 */
export const metadata: Metadata = {
  title: 'Stiller · Dört 15 saniyelik sahne',
  description: 'lerno-motion stil kataloğu: editoryal, blueprint, karanlık enstrüman, veri mürekkebi.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

const PIECES = [
  {
    name: 'Editorial Paper',
    file: 'editorial-average',
    idea: 'Aynı ortalama, farklı sınıf',
    note: 'On bir nokta iki satırda; tek vurgu ortalamayı işaretliyor. Tipografi taşıyor, şekil yok.',
    tokens: '#FAF8F1 · #1B241F · #B5532A',
  },
  {
    name: 'Blueprint',
    file: 'blueprint-orbit',
    idea: 'Düşüyor ama ıskalıyor',
    note: 'Yörünge, hız ve çekim okları; inşaat çizgileri açıklıyor. Etiketler geometrinin yanında.',
    tokens: '#0F2D3D · #E8F1F5 · #7FD1C7',
  },
  {
    name: 'Dark Instrument',
    file: 'dark-wave',
    idea: 'İki dalga, tek toplam',
    note: 'İnce çizgiler, tek sıcak vurgu. Toplam çizgi çekilirken başında bir nokta var.',
    tokens: '#0B0B0C · #F5F3EE · #E0A458',
  },
  {
    name: 'Cinematic',
    file: 'cinematic-impact',
    idea: 'Düşüş ve çarpma',
    note: 'Kamera push-in, üç derinlik, hızlı nesnede hayalet iz, çarpmada halka + toz + sarsıntı. Sesli.',
    tokens: '#0A0C0E · #E8E6E1 · #E0A458 · ses',
  },
  {
    name: 'Data Ink',
    file: 'data-growth',
    idea: 'Toplama karşı katlama',
    note: 'Eksenler önce, seriler soldan sağa, sonra tek açıklama. Dekorasyon yok.',
    tokens: '#FBFAF7 · #1A1A1A · #2F6F4F',
  },
];

export default function StyleGalleryPage() {
  hideInProduction();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <a
        href="/tr/docs/ai/skills/motion"
        className="text-xs text-fd-muted-foreground underline-offset-4 hover:text-fd-foreground hover:underline"
      >
        ← lerno-motion skill
      </a>

      <p className="mt-6 text-xs uppercase tracking-[0.2em] text-fd-muted-foreground">lerno-motion · styles</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-fd-foreground">Dört stil, dört 15 saniyelik sahne</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fd-muted-foreground">
        Her parça tek bir stil kilidi kullanıyor: beş renk, üç tipografi boyu, tek vurgu ve tek hareket
        imzası. Dördü de aynı sözleşmeyle üretildi — storyboard, lint, render, kare denetimi — ama
        birbirine benzemiyor.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {PIECES.map((piece) => (
          <figure key={piece.file} className="m-0 flex flex-col gap-2">
            <video
              src={`/media/styles/${piece.file}.mp4`}
              poster={`/media/styles/${piece.file}.jpg`}
              controls
              loop
              muted
              playsInline
              preload="none"
              className="w-full rounded-xl border border-fd-border bg-fd-background"
            />
            <figcaption className="text-xs leading-relaxed text-fd-muted-foreground">
              <span className="font-semibold text-fd-foreground">{piece.name}</span>
              {' — '}
              {piece.idea}. {piece.note}
              <span className="mt-1 block opacity-70">{piece.tokens}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="mt-12 max-w-2xl text-xs leading-relaxed text-fd-muted-foreground">
        Stil kataloğu ve sayısal hareket kuralları: <code className="text-fd-foreground">skills/lerno-motion/references/styles.md</code>{' '}
        ve <code className="text-fd-foreground">references/motion-language.md</code>. Sahneler:{' '}
        <code className="text-fd-foreground">apps/lerno-docs/scenes/styles/</code>.
      </p>
    </main>
  );
}
