'use client';

import { useMemo, useState } from 'react';
import { VariableStore, ambientLight, directionalLight, group, pointLight, sphere, type Scene3DSpec } from '@medu/lerno-three';
import { ThreeShowcase, type ShowcaseButton } from './ThreeShowcase';
import { useDocsLang } from '../use-docs-lang';

type Vec3 = [number, number, number];

type GeometryKey = 'linear' | 'trigonal' | 'tetrahedral' | 'bipyramidal' | 'octahedral';

const GEOMETRIES: Record<GeometryKey, { directions: Vec3[] }> = {
  linear: { directions: [[1, 0, 0], [-1, 0, 0]] },
  trigonal: { directions: [[1, 0, 0], [-0.5, 0, 0.866], [-0.5, 0, -0.866]] },
  tetrahedral: { directions: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]] },
  bipyramidal: {
    directions: [[0, 1, 0], [0, -1, 0], [1, 0, 0], [-0.5, 0, 0.866], [-0.5, 0, -0.866]],
  },
  octahedral: { directions: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]] },
};

const LABELS = {
  en: {
    linear: 'Linear · 180°',
    trigonal: 'Trigonal planar · 120°',
    tetrahedral: 'Tetrahedral · 109.5°',
    bipyramidal: 'Trigonal bipyramidal · 90/120°',
    octahedral: 'Octahedral · 90°',
    rotate: 'Rotate',
  },
  tr: {
    linear: 'Doğrusal · 180°',
    trigonal: 'Üçgen düzlem · 120°',
    tetrahedral: 'Tetrahedral · 109.5°',
    bipyramidal: 'Üçgen çift piramit · 90/120°',
    octahedral: 'Oktahedral · 90°',
    rotate: 'Döndür',
  },
};

const VARIABLES = { spin: 0 };
const DISTANCE = 1.2;

function buildVsepr(directions: Vec3[]): (store: VariableStore) => Scene3DSpec {
  return (store) => {
    void store;
    const children = [sphere(0.42, { color: '#334155', metalness: 0.3, roughness: 0.4 }, { position: [0, 0, 0] })];

    for (const [x, y, z] of directions) {
      const length = Math.hypot(x, y, z);
      children.push(sphere(0.24, { color: '#42a5f5', metalness: 0.2 }, { position: [(x / length) * DISTANCE, (y / length) * DISTANCE, (z / length) * DISTANCE] }));
    }

    return {
      camera: { position: [0, 1.2, 5.4], lookAt: [0, 0, 0] },
      objects: [
        ambientLight('#ffffff', 0.75),
        directionalLight([4, 7, 5], 1.4),
        pointLight([-3, 2, -3], 0.5),
        group('molecule', children, { bindings: { 'rotation.y': 'spin' } }),
      ],
    };
  };
}

/** Chemistry: VSEPR geometries, central atom, and ligand positions. */
export function VseprDemo() {
  const [selected, setSelected] = useState<GeometryKey>('tetrahedral');
  const t = LABELS[useDocsLang()];
  const build = useMemo(() => buildVsepr(GEOMETRIES[selected].directions), [selected]);
  const buttons: ShowcaseButton[] = [{ label: t.rotate, variable: 'spin', to: Math.PI * 2, spring: true }];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {Object.entries(GEOMETRIES).map(([id, geometry]) => (
          <button
            key={id}
            type="button"
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              id === selected ? 'border-fd-primary bg-fd-primary/10' : 'border-fd-border hover:bg-fd-accent'
            }`}
            onClick={() => setSelected(id as GeometryKey)}
          >
            {t[id as GeometryKey]}
          </button>
        ))}
      </div>
      <ThreeShowcase build={build} variables={VARIABLES} buttons={buttons} autoRotateSpeed={0.25} />
    </div>
  );
}
