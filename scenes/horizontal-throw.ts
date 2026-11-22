import { CircleNode, LineNode, Node, RectNode, TextNode } from '@medu/lerno';

// Storyboard
// 0.0-1.2  establish  two balls rest on a shelf; title and ground still
// 1.2-1.8  aim        a push arrow grows beside the right ball; nothing else moves
// 1.8-3.5  fall       release; both balls fall together, right ball also drifts right
// 2.0-3.5  compare    a dashed line joins the balls, staying horizontal
// 3.5-3.9  impact     both reach the ground; two ticks mark the landing points
// 3.9-5.8  land       result line appears; the rest of the frame holds

const W = 1280;
const H = 720;

const C = {
  paper: '#FAF8F1',
  ink: '#1B241F',
  muted: '#5F635A',
  line: '#DED8C8',
  accent: '#B5532A',
};

const GROUND = 620;
const LEDGE_TOP = 222;
const RADIUS = 14;
const START_Y = LEDGE_TOP - RADIUS;
const REST_Y = GROUND - RADIUS;

const RELEASE = 1.8;
const FALL_TIME = 1.7;
const IMPACT = RELEASE + FALL_TIME;
const GRAVITY = (2 * (REST_Y - START_Y)) / FALL_TIME ** 2;

const LEFT_X = 182;
const RIGHT_START_X = 448;
const HORIZONTAL_SPEED = 220;

export const meta = {
  width: W,
  height: H,
  fps: 30,
  duration: 5.8,
  background: C.paper,
  font: { family: 'Arial', path: '/System/Library/Fonts/Supplemental/Arial.ttf' },
};

export const beats = [0.8, 2.6, 3.6, 4.6];

function text(value: string, x: number, y: number, size: number, fill: string, anchor: 'start' | 'middle' | 'end' = 'start', weight = 400): TextNode {
  return new TextNode(value, x, y, { fontSize: size, fill, anchor, fontWeight: weight });
}

function line(x1: number, y1: number, x2: number, y2: number, stroke: string, width = 1, dash?: string): LineNode {
  return new LineNode(x1, y1, x2, y2, { stroke, strokeWidth: width, ...(dash ? { dash } : {}) });
}

function arrow(x1: number, y: number, x2: number): Node {
  return new Node({
    children: [
      line(x1, y, x2, y, C.accent, 3),
      line(x2, y, x2 - 11, y - 7, C.accent, 3),
      line(x2, y, x2 - 11, y + 7, C.accent, 3),
    ],
  });
}

function progress(t: number, from: number, to: number): number {
  if (t <= from) return 0;
  if (t >= to) return 1;
  const ratio = (t - from) / (to - from);
  return 1 - (1 - ratio) ** 3;
}

function fallOffset(t: number): number {
  const elapsed = Math.max(0, Math.min(FALL_TIME, t - RELEASE));
  return 0.5 * GRAVITY * elapsed ** 2;
}

function build(t: number): Node {
  const landed = t >= IMPACT;
  const leftY = START_Y + fallOffset(t);
  const rightY = leftY;
  const horizontal = Math.min(FALL_TIME, Math.max(0, t - RELEASE));
  const rightX = RIGHT_START_X + HORIZONTAL_SPEED * horizontal;

  const children: Node[] = [
    new RectNode(0, 0, W, H, { fill: C.paper }),
    text('A throw and a drop', 64, 72, 30, C.ink, 'start', 700),
    line(64, GROUND, W - 64, GROUND, C.ink, 2),
    line(150, LEDGE_TOP, 470, LEDGE_TOP, C.ink, 3),
    ...Array.from({ length: 11 }, (_, index) =>
      line(160 + index * 28, LEDGE_TOP + 2, 150 + index * 28, LEDGE_TOP + 14, C.line, 2),
    ),
    new CircleNode(LEFT_X, leftY, RADIUS, { fill: C.ink }),
  ];

  if (!landed) children.push(new CircleNode(rightX, rightY, RADIUS, { fill: C.accent }));

  const aim = progress(t, 1.2, RELEASE);
  if (aim > 0 && !landed) {
    const x1 = rightX + RADIUS + 8;
    children.push(arrow(x1, rightY, x1 + 86 * aim));
  }

  if (t >= 2.0 && !landed) {
    children.push(line(LEFT_X + RADIUS + 6, leftY, rightX - RADIUS - 6, rightY, C.accent, 1, '5 6'));
  }

  if (landed) {
    children.push(new CircleNode(LEFT_X, REST_Y, RADIUS, { fill: C.ink }));
    children.push(new CircleNode(RIGHT_START_X + HORIZONTAL_SPEED * FALL_TIME, REST_Y, RADIUS, { fill: C.accent }));
    children.push(line(LEFT_X - 8, GROUND + 8, LEFT_X + 8, GROUND + 8, C.accent, 3));
    children.push(line(RIGHT_START_X + HORIZONTAL_SPEED * FALL_TIME - 8, GROUND + 8, RIGHT_START_X + HORIZONTAL_SPEED * FALL_TIME + 8, GROUND + 8, C.accent, 3));
  }

  if (t >= 3.9) {
    children.push(text('Same height at every moment. Same time to land.', 64, 108, 17, C.muted));
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
