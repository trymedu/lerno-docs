'use client';

import { ScenePlayer as LernoScenePlayer } from '@medu/lerno-react';
import { beats as throwBeats, createScene as createThrowScene, meta as throwMeta } from '@/scenes/horizontal-throw';
import { beats as speedBeats, createScene as createSpeedScene, meta as speedMeta } from '@/scenes/instantaneous-speed';
import { useDocsLang } from './use-docs-lang';

const SCENES = {
  throw: { create: createThrowScene, meta: throwMeta, beats: throwBeats },
  speed: { create: createSpeedScene, meta: speedMeta, beats: speedBeats },
} as const;

export type SceneName = keyof typeof SCENES;

export interface ScenePlayerProps {
  scene: SceneName;
  title: string;
}

/**
 * Docs-side binding of the library player: it owns the scene registry so the
 * page can pass a name instead of a function across the server boundary.
 */
const LABELS = {
  en: { play: 'Play', pause: 'Pause', restart: 'Restart', seek: 'Time' },
  tr: { play: 'Oynat', pause: 'Duraklat', restart: 'Başa dön', seek: 'Zaman' },
};

export function ScenePlayer({ scene, title }: ScenePlayerProps) {
  const definition = SCENES[scene];
  const labels = LABELS[useDocsLang()];
  return (
    <LernoScenePlayer
      createScene={definition.create}
      meta={definition.meta}
      beats={definition.beats}
      title={title}
      tone="dark"
      labels={labels}
    />
  );
}
