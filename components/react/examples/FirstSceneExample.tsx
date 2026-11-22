'use client';

import { useMemo } from 'react';
import { CircleNode, Node, PathNode, Property, Shape } from '@medu/lerno';
import { Display, useProperty } from '@medu/lerno-react';
import { DocDemo } from '../DocDemo';
import { renderTreeJson } from '@/lib/render-json';

const SOURCE = `'use client';

import { useMemo } from 'react';
import { CircleNode, Node, PathNode, Property, Shape } from '@medu/lerno';
import { Display, useProperty } from '@medu/lerno-react';

export function Scene() {
  const radius = useMemo(() => new Property(40), []);
  const root = useMemo(() => {
    const circle = new CircleNode(240, 160, radius.get(), { fill: 'var(--accent)' });
    radius.link((value) => {
      circle.radius = value;
    });
    return new Node({ children: [new PathNode(Shape.circle(240, 160, 90), { stroke: 'var(--border)' }), circle] });
  }, [radius]);

  useProperty(radius);

  return <Display node={root} width={480} height={320} />;
}`;

/**
 * First-scene example for the docs.
 *
 * The code is shown verbatim on the source tab; the JSON tab shows `toRender()` live,
 * generated from the scene initial state, not written by hand.
 */
export function FirstSceneExample() {
  const radius = useMemo(() => new Property(40), []);
  const root = useMemo(() => {
    const circle = new CircleNode(240, 160, radius.get(), { fill: 'var(--accent)' });
    radius.link((value) => {
      circle.radius = value;
    });
    return new Node({ children: [new PathNode(Shape.circle(240, 160, 90), { stroke: 'var(--border)' }), circle] });
  }, [radius]);

  useProperty(radius);

  const json = useMemo(() => renderTreeJson(root), [root]);

  return (
    <DocDemo source={SOURCE} json={json}>
      <Display node={root} width={480} height={320} />
    </DocDemo>
  );
}
