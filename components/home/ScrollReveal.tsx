'use client';

import { useEffect } from 'react';

/**
 * Marks every `[data-reveal]` element once it enters the viewport. The visual
 * transition lives in `global.css`; this only flips the attribute.
 */
export function ScrollReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

    // The header is transparent over the hero and gains a surface once the
    // reader leaves it.
    const onScroll = () => {
      if (window.scrollY > 32) document.documentElement.setAttribute('data-scrolled', '');
      else document.documentElement.removeAttribute('data-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (elements.length === 0 || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((element) => element.setAttribute('data-reveal-shown', ''));
      return () => window.removeEventListener('scroll', onScroll);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute('data-reveal-shown', '');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return null;
}
