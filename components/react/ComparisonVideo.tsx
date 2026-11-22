'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

export interface ComparisonVideoProps {
  src: string;
  poster: string;
  label: string;
}

/**
 * Poster-first video card. The player is created only after a click, so the page
 * does not preload three media files and the poster is always visible.
 */
export function ComparisonVideo({ src, poster, label }: ComparisonVideoProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <video
        src={src}
        poster={poster}
        controls
        autoPlay
        playsInline
        className="aspect-video w-full rounded-xl border border-zinc-200 bg-black"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play ${label}`}
      className="group relative block aspect-video w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-900"
    >
      <img src={poster} alt="" className="h-full w-full object-cover" />
      <span className="absolute inset-0 grid place-items-center bg-black/20 transition-colors group-hover:bg-black/30">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-zinc-900 shadow-lg">
          <Play className="h-4 w-4 translate-x-[1px] fill-current" />
        </span>
      </span>
    </button>
  );
}
