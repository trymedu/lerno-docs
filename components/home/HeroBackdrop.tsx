'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { AsciiField } from './AsciiField';

/**
 * Sky photograph, blue haze, character field and grain for a hero surface.
 *
 * Publishes `--l-hero-p` (0 above the fold, 1 once the section has scrolled by)
 * on its parent so the layers can drift at different speeds.
 */
export function HeroBackdrop({ density = 0.55 }: { density?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const backdrop = ref.current;
    const surface = backdrop?.parentElement;
    if (!backdrop || !surface) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = surface.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / (rect.height * 0.85)));
      surface.style.setProperty('--l-hero-p', progress.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div ref={ref} className="l-backdrop" aria-hidden>
      <Image src="/hero-sky.jpg" alt="" fill priority sizes="100vw" className="l-sky" />
      <div className="l-tint" />
      <div className="l-scrim" />
      <AsciiField className="l-ascii" density={density} />
      <div className="l-grain" />
    </div>
  );
}
