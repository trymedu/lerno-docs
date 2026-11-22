'use client';

import { useMemo, useRef, useState } from 'react';
import {
  CircleNode,
  DragListener,
  Easings,
  Node,
  PathNode,
  Property,
  RectNode,
  Shape,
  TextNode,
  Vector2,
  animateVector2,
  v2,
  type PropertyAnimation,
} from '@medu/lerno';
import { Display, useProperty } from '@medu/lerno-react';
import { useDocsLang } from './use-docs-lang';

const WIDTH = 600;
const HEIGHT = 360;

/**
 * Fully low-level: own model (`Property`) + scene graph + input
 * (`DragListener`) + tween. No `LernoDocument`; the scene is built from primitives directly.
 */
const LABELS = {
  en: { center: 'Move to center', corner: 'Move to top left', hint: 'Drag the ball.' },
  tr: { center: 'Merkeze taşı', corner: 'Sol üste taşı', hint: 'Topu sürükleyebilirsiniz.' },
};

export function CustomScene() {
  const t = LABELS[useDocsLang()];
  const { root, position } = useMemo(() => {
    const position = new Property(v2(180, 180));

    const grid = new Node();
    for (let x = 0; x <= WIDTH; x += 60) {
      grid.addChild(new PathNode(new Shape().moveTo(x, 0).lineTo(x, HEIGHT), { stroke: 'var(--color-fd-border)', strokeWidth: 1 }));
    }
    for (let y = 0; y <= HEIGHT; y += 60) {
      grid.addChild(new PathNode(new Shape().moveTo(0, y).lineTo(WIDTH, y), { stroke: 'var(--color-fd-border)', strokeWidth: 1 }));
    }

    const arrow = new PathNode(new Shape(), { stroke: 'var(--accent)', strokeWidth: 2.5, dash: '6 4' });
    const ball = new CircleNode(0, 0, 22, { fill: 'var(--accent)', stroke: 'var(--color-fd-card)', strokeWidth: 3 });
    const label = new TextNode('', 0, 0, { fill: 'var(--color-fd-foreground)', fontSize: 14, baseline: 'middle' });

    ball.addInputListener(
      new DragListener({
        drag: (pointer) => {
          if (pointer.delta) position.set(position.get().plus(pointer.delta));
        },
      }),
    );

    position.link((value) => {
      ball.centerX = value.x;
      ball.centerY = value.y;
      arrow.shape = new Shape().moveTo(WIDTH / 2, HEIGHT / 2).lineTo(value.x, value.y);
      label.text = `(${value.x.toFixed(0)}, ${value.y.toFixed(0)})`;
      label.x = value.x + 30;
      label.y = value.y - 30;
    });

    const root = new Node({
      children: [new RectNode(0, 0, WIDTH, HEIGHT, { fill: 'var(--color-fd-background)' }), grid, arrow, ball, label],
    });

    return { root, position };
  }, []);

  // Re-render when the property changes.
  useProperty(position);
  const [, setFrame] = useState(0);
  const animationRef = useRef<PropertyAnimation<Vector2> | null>(null);

  function runAnimation(target: Vector2): void {
    animationRef.current = animateVector2(position, target, { duration: 0.7, easing: Easings.easeInOut });
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const current = animationRef.current;
      if (!current) return;
      const running = current.step(dt);
      setFrame((frame) => frame + 1);
      if (running) requestAnimationFrame(tick);
      else animationRef.current = null;
    };
    requestAnimationFrame(tick);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-fd-border">
        <Display node={root} width={WIDTH} height={HEIGHT} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-lg bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground"
          onClick={() => runAnimation(v2(WIDTH / 2, HEIGHT / 2))}
        >
          {t.center}
        </button>
        <button
          type="button"
          className="rounded-lg border border-fd-border px-4 py-2 text-sm font-medium"
          onClick={() => runAnimation(v2(80, 60))}
        >
          {t.corner}
        </button>
        <span className="text-xs text-fd-muted-foreground">{t.hint}</span>
      </div>
    </div>
  );
}
