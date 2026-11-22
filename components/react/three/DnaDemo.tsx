'use client';

import { useCallback } from 'react';
import { VariableStore, ambientLight, directionalLight, group, pointLight, sphere, type Scene3DSpec } from '@medu/lerno-three';
import { ThreeShowcase, type ShowcaseButton } from './ThreeShowcase';
import { useDocsLang } from '../use-docs-lang';

const VARIABLES = { spin: 0 };

const LABELS = {
  en: { rotate: 'Rotate helix', reset: 'Reset' },
  tr: { rotate: 'Sarmalı döndür', reset: 'Başa al' },
};

const RUNGS = 16;
const RADIUS = 1.1;
const SPACING = 0.32;

function buildDna(store: VariableStore): Scene3DSpec {
  void store;
  const children = [];

  for (let index = 0; index < RUNGS; index += 1) {
    const angle = index * 0.55;
    const y = index * SPACING - ((RUNGS - 1) * SPACING) / 2;
    const x1 = Math.sin(angle) * RADIUS;
    const z1 = Math.cos(angle) * RADIUS;
    const x2 = -x1;
    const z2 = -z1;

    children.push(sphere(0.15, { color: '#42a5f5', metalness: 0.3 }, { position: [x1, y, z1] }));
    children.push(sphere(0.15, { color: '#ef4444', metalness: 0.3 }, { position: [x2, y, z2] }));
    children.push(sphere(0.08, { color: '#94a3b8', roughness: 0.6 }, { position: [(x1 + x2) / 2, y, (z1 + z2) / 2] }));
  }

  return {
    camera: { position: [0, 0.4, 4.6], lookAt: [0, 0, 0] },
    objects: [
      ambientLight('#ffffff', 0.7),
      directionalLight([3, 6, 4], 1.3),
      pointLight([-2, 1, -2], 0.5),
      group('helix', children, { bindings: { 'rotation.y': 'spin' } }),
    ],
  };
}

/** Biology: double-helix geometry and base-pair markers. */
export function DnaDemo() {
  const build = useCallback((store: VariableStore) => buildDna(store), []);
  const t = LABELS[useDocsLang()];
  const buttons: ShowcaseButton[] = [
    { label: t.rotate, variable: 'spin', to: Math.PI * 2, spring: true },
    { label: t.reset, variable: 'spin', to: 0, spring: true },
  ];
  return <ThreeShowcase build={build} variables={VARIABLES} buttons={buttons} autoRotateSpeed={0.35} />;
}
