'use client';

import { useMemo, useRef } from 'react';
import { ThreeCanvas, VariableStore, type Scene3DSpec, type ThreeRuntime } from '@medu/lerno-three';

export interface ShowcaseButton {
  label: string;
  variable: string;
  to: number;
  spring?: boolean;
}

export interface ThreeShowcaseProps {
  build: (store: VariableStore) => Scene3DSpec;
  variables: Record<string, number>;
  buttons?: ShowcaseButton[];
  autoRotateSpeed?: number;
  height?: number;
}

/** Shared shell for 3D demos: variables plus optional animation buttons. */
export function ThreeShowcase({ build, variables, buttons = [], autoRotateSpeed = 0.2, height = 380 }: ThreeShowcaseProps) {
  const { spec, store } = useMemo(() => {
    const instance = new VariableStore();
    for (const [name, value] of Object.entries(variables)) instance.defineNumber(name, value);
    return { spec: build(instance), store: instance };
  }, [build, variables]);

  const runtimeRef = useRef<ThreeRuntime | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-fd-border bg-fd-background">
        <ThreeCanvas
          spec={spec}
          store={store}
          autoRotateSpeed={autoRotateSpeed}
          style={{ height }}
          onReady={(runtime) => {
            runtimeRef.current = runtime;
          }}
        />
      </div>
      {buttons.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3">
          {buttons.map((button) => (
            <button
              key={button.label}
              type="button"
              className="rounded-lg border border-fd-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-fd-accent"
              onClick={() => runtimeRef.current?.animate(button.variable, button.to, button.spring ? { spring: true } : { duration: 0.5 })}
            >
              {button.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
