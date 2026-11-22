'use client';

import { useMemo } from 'react';
import { CircleNode, LineNode, Node, PathNode, Shape, TextNode, v2 } from '@medu/lerno';
import { Display } from '@medu/lerno-react';
import { DocDemo } from '../DocDemo';
import { renderTreeJson } from '@/lib/render-json';

const SOURCE = `import { CircleNode, LineNode, Node, PathNode, Shape, TextNode, v2 } from '@medu/lerno';

const root = new Node({
  children: [
    new PathNode(Shape.circle(480, 270, 80), { stroke: 'var(--accent)', strokeWidth: 3 }),
    new CircleNode(480, 270, 12, { fill: 'var(--accent)', translation: v2(150, 0) }),
    new LineNode(480, 270, 640, 180, { stroke: 'var(--muted)', dash: '6 4' }),
    new TextNode('r = 80', 560, 150, { fill: 'var(--foreground)', fontSize: 16, anchor: 'middle' }),
  ],
});

const tree = root.toRender(); // plain data`;

/**
 * Scene-graph example for the docs.
 *
 * Dord farkli dugum tipini tek agacta toplar; JSON sekmesi ayni agacin toRender() ciktisidir.
 */
export function SceneGraphExample() {
  const root = useMemo(
    () =>
      new Node({
        children: [
          new PathNode(Shape.circle(480, 270, 80), { stroke: 'var(--accent)', strokeWidth: 3 }),
          new CircleNode(480, 270, 12, { fill: 'var(--accent)', translation: v2(150, 0) }),
          new LineNode(480, 270, 640, 180, { stroke: 'var(--muted)', dash: '6 4' }),
          new TextNode('r = 80', 560, 150, { fill: 'var(--foreground)', fontSize: 16, anchor: 'middle' }),
        ],
      }),
    [],
  );

  const json = useMemo(() => renderTreeJson(root), [root]);

  return (
    <DocDemo source={SOURCE} json={json}>
      <Display node={root} width={960} height={540} />
    </DocDemo>
  );
}
