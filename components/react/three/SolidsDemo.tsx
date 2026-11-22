'use client';

import { useCallback } from 'react';
import {
  VariableStore,
  ambientLight,
  box,
  cone,
  cylinder,
  directionalLight,
  pointLight,
  sphere,
  torus,
  type Scene3DSpec,
} from '@medu/lerno-three';
import { ThreeShowcase, type ShowcaseButton } from './ThreeShowcase';
import { useDocsLang } from '../use-docs-lang';

const VARIABLES = { spin: 0, tilt: -0.4 };

const LABELS = {
  en: { rotate: 'Rotate', reset: 'Reset', tilt: 'Tilt', flatten: 'Flatten' },
  tr: { rotate: 'Döndür', reset: 'Başa al', tilt: 'Eğ', flatten: 'Düzle' },
};

function buildSolids(store: VariableStore): Scene3DSpec {
  void store;
  const at = (x: number): [number, number, number] => [x, 0, 0];

  return {
    camera: { position: [0, 2.4, 7], lookAt: [0, 0, 0] },
    objects: [
      ambientLight('#ffffff', 0.7),
      directionalLight([5, 8, 5], 1.4),
      pointLight([-4, 3, -4], 0.5),
      box({ width: 1.3, height: 1.3, depth: 1.3 }, { color: '#42a5f5', metalness: 0.4 }, { position: at(-3), bindings: { 'rotation.y': 'spin' } }),
      sphere(0.8, { color: '#10b981', roughness: 0.3 }, { position: at(-1.5), bindings: { 'rotation.y': 'spin' } }),
      cylinder({ radiusTop: 0.7, radiusBottom: 0.7, height: 1.5 }, { color: '#f59e0b' }, { position: at(0), bindings: { 'rotation.y': 'spin' } }),
      cone({ radius: 0.8, height: 1.6 }, { color: '#ef4444' }, { position: at(1.5), bindings: { 'rotation.y': 'spin' } }),
      torus({ radius: 0.7, tube: 0.24 }, { color: '#8b5cf6', metalness: 0.6 }, { position: at(3), bindings: { 'rotation.y': 'spin', 'rotation.x': 'tilt' } }),
    ],
  };
}

/** Mathematics: basic 3D solids and transform bindings. */
export function SolidsDemo() {
  const build = useCallback((store: VariableStore) => buildSolids(store), []);
  const t = LABELS[useDocsLang()];
  const buttons: ShowcaseButton[] = [
    { label: t.rotate, variable: 'spin', to: Math.PI * 2, spring: true },
    { label: t.reset, variable: 'spin', to: 0, spring: true },
    { label: t.tilt, variable: 'tilt', to: -1.1, spring: true },
    { label: t.flatten, variable: 'tilt', to: 0, spring: true },
  ];
  return <ThreeShowcase build={build} variables={VARIABLES} buttons={buttons} />;
}
