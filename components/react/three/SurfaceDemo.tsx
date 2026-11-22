'use client';

import { useMemo, useState } from 'react';
import { VariableStore, ambientLight, directionalLight, group, pointLight, surface, type Scene3DSpec } from '@medu/lerno-three';
import { ThreeShowcase, type ShowcaseButton } from './ThreeShowcase';
import { useDocsLang } from '../use-docs-lang';

const PRESETS = {
  paraboloid: { fn: (u: number, v: number) => 0.35 * (u * u + v * v) - 2.2 },
  saddle: { fn: (u: number, v: number) => 0.6 * (u * u - v * v) },
  ripple: { fn: (u: number, v: number) => Math.sin(Math.hypot(u, v) * 2) * 1.8 },
  gaussian: { fn: (u: number, v: number) => 3 * Math.exp(-(u * u + v * v) / 3) },
} as const;

const LABELS = {
  en: { paraboloid: 'Paraboloid', saddle: 'Saddle', ripple: 'Ripple', gaussian: 'Gaussian', rotate: 'Rotate', wireframe: 'Wireframe' },
  tr: { paraboloid: 'Paraboloid', saddle: 'Eyer', ripple: 'Dalga', gaussian: 'Gauss', rotate: 'Döndür', wireframe: 'Tel kafes' },
};

type PresetKey = keyof typeof PRESETS;

const VARIABLES = { spin: 0 };

function buildSurface(preset: PresetKey, wireframe: boolean): (store: VariableStore) => Scene3DSpec {
  return (store) => {
    void store;
    const mesh = surface(PRESETS[preset].fn, { uSegments: 48, vSegments: 48, uRange: [-3, 3], vRange: [-3, 3] }, { metalness: 0.15, roughness: 0.55, wireframe });

    return {
      camera: { position: [5, 4, 6], lookAt: [0, 0, 0] },
      objects: [
        ambientLight('#ffffff', 0.7),
        directionalLight([5, 8, 5], 1.4),
        pointLight([-4, 3, -4], 0.5),
        group('surface', [mesh], { bindings: { 'rotation.y': 'spin' } }),
      ],
    };
  };
}

/** Mathematics: `z = f(u, v)` surface, shaded by height. */
export function SurfaceDemo() {
  const [preset, setPreset] = useState<PresetKey>('paraboloid');
  const [wireframe, setWireframe] = useState(false);
  const build = useMemo(() => buildSurface(preset, wireframe), [preset, wireframe]);
  const t = LABELS[useDocsLang()];
  const buttons: ShowcaseButton[] = [{ label: t.rotate, variable: 'spin', to: Math.PI * 2, spring: true }];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
          <button
            key={key}
            type="button"
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              key === preset ? 'border-fd-primary bg-fd-primary/10' : 'border-fd-border hover:bg-fd-accent'
            }`}
            onClick={() => setPreset(key)}
          >
            {t[key]}
          </button>
        ))}
        <button
          type="button"
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            wireframe ? 'border-fd-primary bg-fd-primary/10' : 'border-fd-border hover:bg-fd-accent'
          }`}
          onClick={() => setWireframe((value) => !value)}
        >
          {t.wireframe}
        </button>
      </div>
      <ThreeShowcase build={build} variables={VARIABLES} buttons={buttons} autoRotateSpeed={0.3} />
    </div>
  );
}
