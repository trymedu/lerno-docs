'use client';

import { useMemo, useRef } from 'react';
import { useDocsLang } from './use-docs-lang';
import {
  ThreeCanvas,
  VariableStore,
  ambientLight,
  box,
  directionalLight,
  sphere,
  torus,
  type Scene3DSpec,
  type ThreeRuntime,
} from '@medu/lerno-three';

const EN = {
  bounce: 'Bounce ball',
  lower: 'Lower ball',
  shrink: 'Shrink',
  grow: 'Grow',
  spin: 'Spin cube',
  opacity: 'Transparency',
  caption: 'The scene is driven entirely by variables:',
};

const TR = {
  bounce: 'Topu zıplat',
  lower: 'Yere indir',
  shrink: 'Küçült',
  grow: 'Büyüt',
  spin: 'Küpü döndür',
  opacity: 'Saydamlık',
  caption: 'Sahne tamamen değişkenlerle sürülür:',
};

/** Live Three.js extension demo: variable-bound 3D scene plus spring animations. */
export function ThreeDemo() {
  const { store, spec } = useMemo(() => {
    const store = new VariableStore();
    store.defineNumber('ballY', 1);
    store.defineNumber('ballScale', 1);
    store.defineNumber('cubeSpin', 0);
    store.defineNumber('cubeOpacity', 1);
    store.defineNumber('ringTilt', -0.6);
    store.defineNumber('ringSpin', 0);

    const spec: Scene3DSpec = {
      camera: { position: [4.5, 3.2, 6], lookAt: [0, 1, 0] },
      objects: [
        ambientLight('#ffffff', 0.75),
        directionalLight([5, 8, 5], 1.5),
        box(
          { width: 1.6, height: 1.6, depth: 1.6 },
          { color: '#42a5f5', metalness: 0.45, roughness: 0.25 },
          { position: [-2.2, 1, 0], bindings: { 'rotation.y': 'cubeSpin', 'material.opacity': 'cubeOpacity' } },
        ),
        sphere(1, { color: '#10b981', metalness: 0.2, roughness: 0.35 }, {
          position: [0, 1, 0],
          bindings: { 'position.y': 'ballY', 'scale.x': 'ballScale', 'scale.y': 'ballScale', 'scale.z': 'ballScale' },
        }),
        torus({ radius: 1, tube: 0.35 }, { color: '#f59e0b', metalness: 0.6, roughness: 0.3 }, {
          position: [2.2, 1, 0],
          bindings: { 'rotation.x': 'ringTilt', 'rotation.z': 'ringSpin' },
        }),
      ],
    };

    return { store, spec };
  }, []);

  const runtimeRef = useRef<ThreeRuntime | null>(null);
  const t = useDocsLang() === 'tr' ? TR : EN;

  const buttons: { label: string; run: () => void }[] = [
    { label: t.bounce, run: () => runtimeRef.current?.animate('ballY', 2.6, { spring: true, stiffness: 180, damping: 14 }) },
    { label: t.lower, run: () => runtimeRef.current?.animate('ballY', 1, { spring: true, stiffness: 140, damping: 18 }) },
    { label: t.shrink, run: () => runtimeRef.current?.animate('ballScale', 0.6, { duration: 0.4 }) },
    { label: t.grow, run: () => runtimeRef.current?.animate('ballScale', 1, { duration: 0.4 }) },
    { label: t.spin, run: () => runtimeRef.current?.animate('cubeSpin', Math.PI * 2, { spring: true, stiffness: 90, damping: 16 }) },
    { label: t.opacity, run: () => runtimeRef.current?.animate('cubeOpacity', 0.35, { duration: 0.5 }) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-fd-border bg-fd-background">
        <ThreeCanvas
          spec={spec}
          store={store}
          autoRotateSpeed={0.25}
          style={{ height: 380 }}
          onReady={(runtime) => {
            runtimeRef.current = runtime;
          }}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {buttons.map((button) => (
          <button
            key={button.label}
            type="button"
            className="rounded-lg border border-fd-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-fd-accent"
            onClick={button.run}
          >
            {button.label}
          </button>
        ))}
      </div>
      <span className="text-xs text-fd-muted-foreground">
        {t.caption} <code>ballY</code>, <code>ballScale</code>, <code>cubeSpin</code>, <code>cubeOpacity</code>,{' '}
        <code>ringTilt</code>.
      </span>
    </div>
  );
}
