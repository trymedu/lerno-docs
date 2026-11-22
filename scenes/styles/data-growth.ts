import { CircleNode, LineNode, Node, PathNode, RectNode, Shape, TextNode } from '@medu/lerno';

// Storyboard — Data Ink
// 0.0-2.0   establish  axes, ticks, title; nothing moves
// 2.0-5.0   linear     the steady series draws left to right
// 5.0-9.0   doubling   the exponential series draws; endpoint dot pulses once
// 9.0-12.0  annotate   leader line and the x32 label
// 12.0-15.0 land       caption; the frame holds

const W = 1280;
const H = 720;

const C = {
  paper: '#FBFAF7',
  ink: '#1A1A1A',
  muted: '#6B6B6B',
  line: '#E8E5DE',
  accent: '#2F6F4F',
};

const X0 = 180;
const X1 = 1140;
const Y0 = 600;
const Y1 = 150;

const MAX_X = 20;
const MAX_Y = 36;

export const meta = {
  width: W,
  height: H,
  fps: 30,
  duration: 15,
  background: C.paper,
  font: { family: 'Arial', path: '/System/Library/Fonts/Supplemental/Arial.ttf' },
};

export const beats = [1.0, 3.5, 6.5, 10.0, 13.0];

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

function px(x: number): number {
  return X0 + (x / MAX_X) * (X1 - X0);
}

function py(y: number): number {
  return Y0 - (y / MAX_Y) * (Y0 - Y1);
}

function series(progress: number, value: (x: number) => number, stroke: string, width: number): Node {
  const end = clamp01(progress);
  const shape = new Shape();
  const steps = Math.max(2, Math.ceil(120 * end));
  for (let index = 0; index <= steps; index += 1) {
    const x = (MAX_X * end * index) / steps;
    if (index === 0) shape.moveTo(px(x), py(value(x)));
    else shape.lineTo(px(x), py(value(x)));
  }
  return new PathNode(shape, { stroke, strokeWidth: width });
}

const linear = (x: number): number => x;
const doubling = (x: number): number => 2 ** (x / 4);

function build(t: number): Node {
  const children: Node[] = [
    new RectNode(0, 0, W, H, { fill: C.paper }),
    text('Doubling beats adding', 64, 100, 32, C.ink, 700),
    line(X0, Y0, X1, Y0, C.ink, 1),
    line(X0, Y0, X0, Y1, C.ink, 1),
  ];

  for (let tick = 0; tick <= 20; tick += 5) {
    children.push(line(px(tick), Y0, px(tick), Y0 + 6, C.line, 1));
    children.push(text(String(tick), px(tick), Y0 + 30, 13, C.muted, 400, 'middle'));
  }
  for (let tick = 0; tick <= 30; tick += 10) {
    children.push(line(X0 - 6, py(tick), X0, py(tick), C.line, 1));
    children.push(text(String(tick), X0 - 16, py(tick) + 4, 13, C.muted, 400, 'end'));
  }
  children.push(text('steps', X1, Y0 + 50, 12, C.muted, 400, 'end'));

  if (t >= 2) children.push(series(easeOut((t - 2) / 3), linear, C.muted, 2));
  if (t >= 5) {
    children.push(series(easeOut((t - 5) / 3.6), doubling, C.accent, 2.5));

    const pulse = clamp01((t - 8.6) / 0.5);
    const radius = 5 + 4 * Math.sin(Math.PI * pulse);
    if (t >= 8.6) children.push(new CircleNode(px(MAX_X), py(doubling(MAX_X)), radius, { fill: C.accent }));
  }

  if (t >= 9.6) {
    const endX = px(MAX_X);
    const endY = py(doubling(MAX_X));
    const reveal = easeOut((t - 9.6) / 0.5);
    children.push(line(endX - 6, endY, endX - 6 - 120 * reveal, endY - 58 * reveal, C.muted, 1, '4 5'));
    children.push(text('×32', endX - 140, endY - 70, 30, C.accent, 700, 'end'));
    children.push(text('same start, 20 steps', endX - 140, endY - 46, 12, C.muted, 400, 'end'));
  }

  if (t >= 12) {
    children.push(text('Linear adds. Exponential multiplies.', 64, 660, 16, C.muted));
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
