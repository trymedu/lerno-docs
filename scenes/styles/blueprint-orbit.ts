import { CircleNode, LineNode, Node, PathNode, RectNode, Shape, TextNode } from '@medu/lerno';

// Storyboard — Blueprint
// 0.0-2.0   establish  Earth disc with meridians, title; still
// 2.0-4.0   draw       the orbit ring draws itself clockwise from the top
// 4.0-11.0  fall       satellite travels one orbit; velocity and gravity arrows follow
// 11.0-15.0 land       motion stops, caption appears; the frame holds

const W = 1280;
const H = 720;

const C = {
  paper: '#0F2D3D',
  ink: '#E8F1F5',
  muted: '#8FAAB6',
  line: 'rgba(232,241,245,0.32)',
  accent: '#7FD1C7',
};

const CX = 640;
const CY = 455;
const R = 225;
const EARTH = 125;

export const meta = {
  width: W,
  height: H,
  fps: 30,
  duration: 15,
  background: C.paper,
  font: { family: 'Arial', path: '/System/Library/Fonts/Supplemental/Arial.ttf' },
};

export const beats = [1.0, 3.0, 6.0, 9.0, 12.5];

function text(value: string, left: number, top: number, size: number, fill: string, weight = 500, anchor: 'start' | 'middle' | 'end' = 'start'): TextNode {
  return new TextNode(value, left, top, { fontSize: size, fill, fontWeight: weight, anchor });
}

function line(x1: number, y1: number, x2: number, y2: number, stroke: string, width = 1.5, dash?: string): LineNode {
  return new LineNode(x1, y1, x2, y2, { stroke, strokeWidth: width, ...(dash ? { dash } : {}) });
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function easeOut(value: number): number {
  return 1 - (1 - clamp01(value)) ** 3;
}

/** Partial circle as a path, clockwise from the top. */
function arc(progress: number): Node {
  const shape = new Shape();
  const end = clamp01(progress);
  const steps = Math.max(2, Math.ceil(140 * end));
  for (let index = 0; index <= steps; index += 1) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * end * index) / steps;
    const px = CX + Math.cos(angle) * R;
    const py = CY + Math.sin(angle) * R;
    if (index === 0) shape.moveTo(px, py);
    else shape.lineTo(px, py);
  }
  return new PathNode(shape, { stroke: C.line, strokeWidth: 1.5 });
}

function arrow(x1: number, y1: number, x2: number, y2: number, stroke: string): Node {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 11;
  const shape = new Shape()
    .moveTo(x2, y2)
    .lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6))
    .moveTo(x2, y2)
    .lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
  return new Node({ children: [line(x1, y1, x2, y2, stroke, 2), new PathNode(shape, { stroke, strokeWidth: 2 })] });
}

function earth(): Node[] {
  const nodes: Node[] = [new CircleNode(CX, CY, EARTH, { stroke: C.ink, strokeWidth: 1.5 })];
  nodes.push(line(CX - EARTH + 22, CY, CX + EARTH - 22, CY, C.muted, 1, '4 6'));
  return nodes;
}

function build(t: number): Node {
  const children: Node[] = [
    new RectNode(0, 0, W, H, { fill: C.paper }),
    text('FALLING, BUT MISSING', 64, 96, 30, C.ink, 700),
    ...earth(),
    arc(easeOut((t - 2) / 2)),
  ];

  const orbit = clamp01((t - 4) / 7);
  if (t >= 4) {
    const angle = -Math.PI / 2 + Math.PI * 2 * orbit;
    const px = CX + Math.cos(angle) * R;
    const py = CY + Math.sin(angle) * R;
    const tangent = angle + Math.PI / 2;

    children.push(line(CX + Math.cos(angle) * (EARTH + 10), CY + Math.sin(angle) * (EARTH + 10), px, py, C.line, 1, '5 7'));
    children.push(new CircleNode(px, py, 7, { fill: C.accent }));
    children.push(arrow(px, py, px + Math.cos(tangent) * 78, py + Math.sin(tangent) * 78, C.accent));
    children.push(arrow(px, py, px - Math.cos(angle) * 72, py - Math.sin(angle) * 72, C.ink));

    children.push(text('v', px + Math.cos(tangent) * 60 + Math.cos(tangent + Math.PI / 2) * 18, py + Math.sin(tangent) * 60 + Math.sin(tangent + Math.PI / 2) * 18, 14, C.accent, 700, 'middle'));
    children.push(text('F', px - Math.cos(angle) * 54 + Math.cos(angle + Math.PI / 2) * 20, py - Math.sin(angle) * 54 + Math.sin(angle + Math.PI / 2) * 20, 14, C.ink, 700, 'middle'));
  }

  if (t >= 11) {
    children.push(text('It falls around, not into.', 64, 640, 18, C.muted));
    children.push(text('one orbit · 90 min', W - 64, 640, 12, C.muted, 500, 'end'));
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
