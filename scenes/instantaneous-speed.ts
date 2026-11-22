import { CircleNode, LineNode, Node, PathNode, RectNode, Shape, TextNode } from '@medu/lerno';

// Storyboard
// 0.0-0.4   establish  axes, ticks, title; nothing moves
// 0.4-2.2   draw       the position curve draws itself left to right
// 2.6-4.2   points     P at t = 2, then Q one step ahead; average speed appears
// 4.2-8.4   shrink     Q slides toward P; the secant rotates into the tangent, 5.00 -> 4.00
// 8.4-10.0  hold       tangent and v = 4.00 stand still
// 10.0-16.0 slide      the tangent travels along the curve; v runs 4.0 -> 6.0
// 16.0-19.0 land       summary line at the foot; the frame holds still

const W = 1280;
const H = 720;

const C = {
  paper: '#FAF8F1',
  ink: '#1B241F',
  muted: '#5F635A',
  line: '#DED8C8',
  accent: '#B5532A',
};

const X0 = 150;
const Y0 = 580;
const XS = 200;
const YS = 26;

const DRAW_FROM = 0.4;
const DRAW_TO = 2.2;
const P_AT = 2.6;
const Q_AT = 3.2;
const SHRINK_FROM = 4.2;
const SHRINK_TO = 8.4;
const SLIDE_FROM = 10;
const SLIDE_TO = 16;
const SUMMARY_AT = 16.5;

const P_T = 2;

export const meta = {
  width: W,
  height: H,
  fps: 30,
  duration: 19,
  background: C.paper,
  font: { family: 'Arial', path: '/System/Library/Fonts/Supplemental/Arial.ttf' },
};

export const beats = [1.0, 3.3, 5.4, 8.6, 12.5, 17.5];

function x(t: number): number {
  return X0 + t * XS;
}

function y(s: number): number {
  return Y0 - s * YS;
}

function position(t: number): number {
  return t * t;
}

function text(
  value: string,
  left: number,
  top: number,
  size: number,
  fill: string,
  anchor: 'start' | 'middle' | 'end' = 'start',
  weight = 400,
): TextNode {
  return new TextNode(value, left, top, { fontSize: size, fill, anchor, fontWeight: weight });
}

function line(x1: number, y1: number, x2: number, y2: number, stroke: string, width = 1, dash?: string): LineNode {
  return new LineNode(x1, y1, x2, y2, { stroke, strokeWidth: width, ...(dash ? { dash } : {}) });
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function easeOut(value: number): number {
  return 1 - (1 - value) ** 3;
}

function curve(progress: number): Node {
  const shape = new Shape().moveTo(x(0), y(0));
  const steps = Math.max(2, Math.ceil(140 * progress));
  for (let index = 1; index <= steps; index += 1) {
    const t = (4 * progress * index) / steps;
    shape.lineTo(x(t), y(position(t)));
  }
  return new PathNode(shape, { stroke: C.ink, strokeWidth: 2 });
}

function tangent(t: number): Node {
  const px = x(t);
  const py = y(position(t));
  const slope = (-2 * t * YS) / XS;
  const dx = 130;
  return line(px - dx, py - slope * dx, px + dx, py + slope * dx, C.accent, 2);
}

function axes(): Node[] {
  const nodes: Node[] = [
    line(X0, Y0, x(4) + 40, Y0, C.ink, 2),
    line(X0, Y0, X0, 140, C.ink, 2),
    text('t (s)', x(4) + 34, Y0 + 26, 14, C.muted, 'end'),
    text('s (m)', X0 - 12, 136, 14, C.muted, 'start'),
  ];

  for (let tick = 1; tick <= 4; tick += 1) {
    nodes.push(line(x(tick), Y0, x(tick), Y0 + 8, C.line, 2));
    nodes.push(text(String(tick), x(tick), Y0 + 26, 12, C.muted, 'middle'));
  }

  for (let value = 4; value <= 16; value += 4) {
    nodes.push(line(X0 - 8, y(value), X0, y(value), C.line, 2));
    nodes.push(text(String(value), X0 - 14, y(value) + 4, 12, C.muted, 'end'));
  }

  return nodes;
}

function build(t: number): Node {
  const children: Node[] = [
    new RectNode(0, 0, W, H, { fill: C.paper }),
    text('Speed at one instant', 64, 72, 30, C.ink, 'start', 700),
    ...axes(),
    curve(easeOut(clamp01((t - DRAW_FROM) / (DRAW_TO - DRAW_FROM)))),
  ];

  const shrinking = clamp01((t - SHRINK_FROM) / (SHRINK_TO - SHRINK_FROM));
  const slided = clamp01((t - SLIDE_FROM) / (SLIDE_TO - SLIDE_FROM));
  const h = t < SHRINK_FROM ? 1 : (1 - shrinking) ** 2;
  const sliding = t >= SLIDE_FROM;
  const focus = sliding ? P_T + easeOut(slided) : P_T;

  if (t >= P_AT && !sliding) {
    const px = x(P_T);
    const py = y(position(P_T));
    children.push(new CircleNode(px, py, 6, { fill: C.accent }));
    children.push(text('P', px - 12, py - 12, 13, C.muted, 'end'));

    if (t >= Q_AT && h > 0.12) {
      const qx = x(P_T + h);
      const qy = y(position(P_T + h));
      children.push(line(px, py, qx, qy, C.muted, 1, '5 5'));
      children.push(new CircleNode(qx, qy, 6, { fill: C.ink }));
      children.push(text('Q', qx + 10, qy + 4, 13, C.muted, 'start'));
    }

    if (h <= 0.12) children.push(tangent(P_T));
  }

  if (sliding) {
    const px = x(focus);
    const py = y(position(focus));
    children.push(tangent(focus));
    children.push(new CircleNode(px, py, 6, { fill: C.accent }));
    children.push(text('P', px - 12, py - 12, 13, C.muted, 'end'));
  }

  if (t >= P_AT) {
    const value = h <= 0.12 ? 2 * P_T : 2 * P_T + h;
    const shown = t >= SLIDE_FROM ? 2 * focus : value;
    children.push(text(`v = ${shown.toFixed(2)} m/s`, 1216, 92, 34, C.accent, 'end', 700));
    children.push(
      text(
        h <= 0.12 ? `at t = ${focus.toFixed(2)} s` : `over the next ${h.toFixed(2)} s`,
        1216,
        124,
        15,
        C.muted,
        'end',
      ),
    );
  }

  if (t >= SUMMARY_AT) {
    children.push(text('The tangent slope is the speed at that instant.', 64, 660, 17, C.muted));
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
