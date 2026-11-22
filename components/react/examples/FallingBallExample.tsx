'use client';

import { useMemo } from 'react';
import { CircleNode, Node, Property, Sim, createScreen } from '@medu/lerno';
import { Display, useSimStep } from '@medu/lerno-react';
import { DocDemo } from '../DocDemo';
import { renderTreeJson } from '@/lib/render-json';

const SOURCE = `'use client';

import { useMemo } from 'react';
import { CircleNode, Node, Property, Sim, createScreen } from '@medu/lerno';
import { Display, useSimStep } from '@medu/lerno-react';

class FallModel {
  readonly height = new Property(240);
  readonly velocity = new Property(0);

  step(dt: number): void {
    const next = this.velocity.get() + 9.8 * dt;
    this.velocity.set(next);
    this.height.set(Math.max(0, this.height.get() - next * dt));
  }
}

export function FallingBall() {
  const { sim, root } = useMemo(() => {
    const screen = createScreen(
      'Free Fall',
      () => new FallModel(),
      (model) => {
        const ball = new CircleNode(240, model.height.get(), 16, { fill: 'var(--accent)' });
        model.height.link((value) => {
          ball.centerY = value;
        });
        return new Node({ children: [ball] });
      },
    );

    const sim = new Sim({ screens: [screen], width: 480, height: 320 });
    screen.createModel();
    return { sim, root: screen.createView() };
  }, []);

  useSimStep(sim);

  return <Display node={root} width={480} height={320} />;
}`;

/** Free-fall example: model built with Sim, view built with Node. */
export function FallingBallExample() {
  const { sim, root } = useMemo(() => {
    const screen = createScreen(
      'Free Fall',
      () => new FallModel(),
      (model) => {
        const ball = new CircleNode(240, model.height.get(), 16, { fill: 'var(--accent)' });
        model.height.link((value) => {
          ball.centerY = value;
        });
        return new Node({ children: [ball] });
      },
    );

    const sim = new Sim({ screens: [screen], width: 480, height: 320 });
    screen.createModel();
    return { sim, root: screen.createView() };
  }, []);

  useSimStep(sim);

  // render tree of the view at its initial state
  const json = useMemo(() => renderTreeJson(root), [root]);

  return (
    <DocDemo source={SOURCE} json={json}>
      <Display node={root} width={480} height={320} />
    </DocDemo>
  );
}

class FallModel {
  readonly height = new Property(240);
  readonly velocity = new Property(0);

  /**
   * Advances the model by one step.
   * @param dt - Elapsed time in seconds.
   */
  step(dt: number): void {
    const next = this.velocity.get() + 9.8 * dt;
    this.velocity.set(next);
    this.height.set(Math.max(0, this.height.get() - next * dt));
  }
}
