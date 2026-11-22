import { CircleNode, LineNode, Node, RectNode, TextNode } from '@medu/lerno';

// Storyboard — Editorial Paper
// 0.0-2.2   establish  title, two baselines, one rule; nothing moves
// 2.2-4.2   group A    eleven dots drop in, left to right; tight cluster
// 4.2-6.4   group B    eleven dots drop in; same mean, wide spread
// 6.4-8.4   mean       one accent rule marks 50 in both rows
// 8.4-11.0  consequence sigma labels appear (3.6 vs 28.7)
// 11.0-15.0 land       caption; the frame holds still

const W = 1280;
const H = 720;

const C = {
  paper: '#FAF8F1',
  ink: '#1B241F',
  muted: '#5F635A',
  line: '#DED8C8',
  accent: '#B5532A',
};

const GROUP_A = [44, 46, 48, 49, 50, 50, 51, 52, 54, 55, 56];
const GROUP_B = [16, 18, 20, 22, 24, 50, 76, 78, 80, 82, 84];

const X0 = 260;
const SCALE = 8;
const ROW_A = 360;
const ROW_B = 520;

export const meta = {
  width: W,
  height: H,
  fps: 30,
  duration: 15,
  background: C.paper,
  font: { family: 'Arial', path: '/System/Library/Fonts/Supplemental/Arial.ttf' },
};

export const beats = [1.0, 3.2, 5.4, 7.6, 9.6, 13.0];

function x(value: number): number {
  return X0 + value * SCALE;
}

function text(value: string, left: number, top: number, size: number, fill: string, weight = 400, anchor: 'start' | 'middle' | 'end' = 'start'): TextNode {
  return new TextNode(value, left, top, { fontSize: size, fill, fontWeight: weight, anchor });
}

function line(x1: number, y1: number, x2: number, y2: number, stroke: string, width = 1, dash?: string): LineNode {
  return new LineNode(x1, y1, x2, y2, { stroke, strokeWidth: width, ...(dash ? { dash } : {}) });
}

function easeOut(value: number): number {
  return 1 - (1 - Math.max(0, Math.min(1, value))) ** 3;
}

/** Dots arrive one by one, each with a short drop. */
function dots(values: number[], rowY: number, start: number, t: number): Node[] {
  return values.map((value, index) => {
    const local = easeOut((t - start - index * 0.11) / 0.32);
    if (local <= 0) return new CircleNode(x(value), rowY - 28, 0, { fill: C.ink });
    return new CircleNode(x(value), rowY - 28 + 28 * local, 9 * local, { fill: C.ink });
  });
}

function group(values: number[], rowY: number, start: number, t: number, label: string, sigma: string): Node[] {
  const nodes: Node[] = [
    line(x(0) - 24, rowY + 12, x(100) + 24, rowY + 12, C.line, 1),
    ...dots(values, rowY, start, t),
  ];

  if (t >= start) {
    nodes.push(text(label, x(0) - 24, rowY - 34, 11, C.muted, 600, 'start'));
  }
  if (t >= 8.4) {
    const reveal = easeOut((t - 8.4) / 0.5);
    nodes.push(text(`σ ${sigma}`, x(100) + 40, rowY + 2, 12, C.muted, 600, 'start'));
    nodes.push(line(x(100) + 12, rowY + 12, x(100) + 12 + 18 * reveal, rowY + 12, C.line, 1));
  }
  return nodes;
}

function build(t: number): Node {
  const children: Node[] = [
    new RectNode(0, 0, W, H, { fill: C.paper }),
    text('Same average.', 72, 132, 40, C.ink, 700),
    line(72, 164, 72 + 140 * easeOut(t / 1.2), 164, C.accent, 3),
    ...group(GROUP_A, ROW_A, 2.2, t, 'GROUP A', '3.6'),
    ...group(GROUP_B, ROW_B, 4.2, t, 'GROUP B', '28.7'),
  ];

  if (t >= 6.4) {
    const grow = easeOut((t - 6.4) / 0.5);
    for (const row of [ROW_A, ROW_B]) {
      children.push(line(x(50), row - 56, x(50), row - 56 + 90 * grow, C.accent, 2));
    }
    children.push(text('mean 50', x(50) + 12, ROW_A - 64, 12, C.accent, 600, 'start'));
  }

  if (t >= 9.2) {
    children.push(text('The mean is one number. The class is not.', 72, 652, 17, C.muted));
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
