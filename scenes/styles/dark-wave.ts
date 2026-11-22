import { CircleNode, LineNode, Node, PathNode, RectNode, Shape, TextNode } from '@medu/lerno';

// Storyboard — Dark Instrument
// 0.0-2.0   establish  faint axes, title; nothing moves
// 2.0-5.0   wave A     first sine draws left to right with a leading point
// 5.0-8.0   wave B     second sine draws at double frequency
// 8.0-11.0  sum        the accent sum draws; a single halo marks its head
// 11.0-15.0 land       labels appear, caption; the frame holds

const W = 1280;
const H = 720;

const C = {
  paper: '#0B0B0C',
  ink: '#F5F3EE',
  muted: '#8A8A8A',
  line: 'rgba(245,243,238,0.14)',
  accent: '#E0A458',
};

const X0 = 120;
const X1 = 1150;
const MID = 380;
const AMP = 96;

export const meta = {
  width: W,
  height: H,
  fps: 30,
  duration: 15,
  background: C.paper,
  font: { family: 'Arial', path: '/System/Library/Fonts/Supplemental/Arial.ttf' },
};

export const beats = [1.0, 3.5, 6.0, 9.0, 12.5];

function text(value: string, left: number, top: number, size: number, fill: string, weight = 400, anchor: 'start' | 'middle' | 'end' = 'start'): TextNode {
  return new TextNode(value, left, top, { fontSize: size, fill, fontWeight: weight, anchor });
}

function line(x1: number, y1: number, x2: number, y2: number, stroke: string, width = 1, dash?: string): LineNode {
  return new LineNode(x1, y1, x2, y2, { stroke, strokeWidth: width, ...(dash ? { dash } : {}) });
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function easeOut(value: number): number {
  return 1 - (1 - clamp01(value)) ** 3;
}

const A = (u: number): number => Math.sin(Math.PI * 4 * u);
const B = (u: number): number => 0.55 * Math.sin(Math.PI * 8 * u + 0.9);

/** Draws a wave up to `progress`, returning the node and the head position. */
function wave(progress: number, value: (u: number) => number, stroke: string, width: number): { node: Node; head: [number, number] } {
  const end = clamp01(progress);
  const shape = new Shape();
  const steps = Math.max(2, Math.ceil(160 * end));
  for (let index = 0; index <= steps; index += 1) {
    const u = (end * index) / steps;
    const px = X0 + (X1 - X0) * u;
    const py = MID - value(u) * AMP;
    if (index === 0) shape.moveTo(px, py);
    else shape.lineTo(px, py);
  }
  const headX = X0 + (X1 - X0) * end;
  const headY = MID - value(end) * AMP;
  return { node: new PathNode(shape, { stroke, strokeWidth: width }), head: [headX, headY] };
}

function build(t: number): Node {
  const children: Node[] = [
    new RectNode(0, 0, W, H, { fill: C.paper }),
    text('Two waves, one sum', 64, 100, 32, C.ink, 600),
    line(X0 - 20, MID, X1 + 20, MID, C.line, 1),
    line(X0 - 20, MID - AMP, X1 + 20, MID - AMP, C.line, 1, '4 8'),
    line(X0 - 20, MID + AMP, X1 + 20, MID + AMP, C.line, 1, '4 8'),
  ];

  if (t >= 2) {
    const a = wave(easeOut((t - 2) / 2.4), A, 'rgba(245,243,238,0.55)', 1.5);
    children.push(a.node, new CircleNode(a.head[0], a.head[1], 4, { fill: 'rgba(245,243,238,0.7)' }));
  }

  if (t >= 5) {
    const b = wave(easeOut((t - 5) / 2.4), B, 'rgba(245,243,238,0.32)', 1.5);
    children.push(b.node, new CircleNode(b.head[0], b.head[1], 3.5, { fill: 'rgba(245,243,238,0.45)' }));
  }

  if (t >= 8) {
    const sum = wave(easeOut((t - 8) / 2.4), (u) => A(u) + B(u), C.accent, 2.5);
    if (t < 11) {
      children.push(new CircleNode(sum.head[0], sum.head[1], 26, { fill: C.accent, opacity: 0.08 }));
    }
    children.push(sum.node, new CircleNode(sum.head[0], sum.head[1], 5, { fill: C.accent }));

    if (t >= 10.4) {
      const legend = [
        { y: 150, stroke: 'rgba(245,243,238,0.55)', label: 'A', fill: C.muted, weight: 600 },
        { y: 178, stroke: 'rgba(245,243,238,0.32)', label: 'B', fill: C.muted, weight: 600 },
        { y: 206, stroke: C.accent, label: 'A + B', fill: C.accent, weight: 700 },
      ];
      for (const entry of legend) {
        children.push(line(1010, entry.y, 1050, entry.y, entry.stroke, 2));
        children.push(text(entry.label, 1062, entry.y + 4, 13, entry.fill, entry.weight, 'start'));
      }
    }
  }

  if (t >= 11.5) {
    children.push(text('Where they add, the signal survives.', 64, 640, 18, C.muted));
  }

  return new Node({ children });
}

export function createScene() {
  let t = 0;
  const root = new Node();
  root.addChild(build(0));

  return {
    root,
    step(dt: number) {
      t += dt;
      root.clearChildren();
      root.addChild(build(t));
    },
  };
}
