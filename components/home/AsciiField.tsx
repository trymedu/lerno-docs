'use client';

import { useEffect, useRef } from 'react';

/**
 * Glyph ramp, sparse to dense. Letters mixed with symbols give the texture a
 * hand-set look rather than a terminal dump.
 */
const RAMP = 'hkao*#MW8%B$@';

function hash(x: number, y: number): number {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function noise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

type AsciiFieldProps = {
  /** 0 to 1. Raises the overall glyph density. */
  density?: number;
  className?: string;
};

/**
 * A boolean field of characters drawn to a low resolution canvas and scaled up
 * by CSS, which is what produces the soft, out of focus look of the texture.
 * It pauses when off screen and draws a single still frame when the reader
 * asked for reduced motion.
 */
export function AsciiField({ density = 0.55, className }: AsciiFieldProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const densityRef = useRef(density);
  densityRef.current = density;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let cell = 10;
    let cols = 0;
    let rows = 0;
    let frame = 0;
    let lastDraw = 0;
    let visible = true;

    const draw = (time: number) => {
      const t = reduced ? 0 : time / 2600;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.62)';

      for (let y = 0; y < rows; y += 1) {
        const ny = y / rows;

        for (let x = 0; x < cols; x += 1) {
          const nx = x / cols;

          // Two octaves drifting against each other.
          const n = noise(nx * 3.6 + t * 0.32, ny * 3.2 - t * 0.18) * 0.62
            + noise(nx * 8.4 - t * 0.22, ny * 7.1 + t * 0.14) * 0.38;

          const band = 0.9 + 0.1 * Math.sin(x * 0.37 + Math.sin(x * 0.08) * 2.2);

          // The field is mostly filled; density comes from which glyph is
          // picked, which is what gives the reference its dithered-gradient look.
          const value = (n - 0.5) * 1.9 + 0.5;
          const level = Math.min(
            1,
            Math.max(0, value * band * (0.75 + densityRef.current * 0.55)),
          );
          if (level < 0.08) continue;

          const index = Math.min(RAMP.length - 1, Math.floor(Math.pow(level, 0.7) * RAMP.length));
          ctx.fillText(RAMP[index], x * cell, y * cell);
        }
      }
    };

    const loop = (time: number) => {
      frame = requestAnimationFrame(loop);
      if (!visible) return;
      if (time - lastDraw < 110) return;
      lastDraw = time;
      draw(time);
    };

    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      // Backing store stays small on purpose: the upscaling is the blur.
      width = Math.min(1024, Math.max(320, Math.round(rect.width * 0.6)));
      height = Math.max(1, Math.round((width * rect.height) / rect.width));
      // Keep one glyph the same size on screen at every breakpoint; without
      // this the phone clamps to the smallest cell and turns into fine static.
      cell = Math.max(5, Math.round((9 * width) / rect.width));
      cols = Math.ceil(width / cell);
      rows = Math.ceil(height / cell);

      canvas.width = width;
      canvas.height = height;
      ctx.font = `${cell}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textBaseline = 'top';
      lastDraw = 0;
    };

    measure();
    draw(reduced ? 0 : 1200);
    if (!reduced) frame = requestAnimationFrame(loop);

    const resizeObserver = new ResizeObserver(() => {
      measure();
      draw(performance.now());
    });
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
      },
      { rootMargin: '120px' },
    );
    intersectionObserver.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
