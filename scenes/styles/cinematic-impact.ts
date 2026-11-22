import { CircleNode, LineNode, Node, RectNode, TextNode, Vector2 } from '@medu/lerno';

// Storyboard — Cinematic (not a slide)
// 0.0-4.6   wide      rain, warm pool of light on the ground, the ball enters from above
// 4.6-9.8   closer    camera pushes in and follows the ball; trail ghosting; light sweep
// 9.8-15.0  impact    flash, shockwave, dust, decaying shake, ball settles

const W = 1280;
const H = 720;

const C = {
  paper: '#0A0C0E',
  ink: '#E8E6E1',
  muted: '#6F777E',
  accent: '#E0A458',
};

const GROUND = 620;
const BALL_X = 640;
const BALL_R = 18;
const START = -40;
const IMPACT = 9.8;

export const meta = {
  width: W,
  height: H,
  fps: 30,
  duration: 15,
  background: C.paper,
  font: { family: 'Arial', path: '/System/Library/Fonts/Supplemental/Arial.ttf' },
};

export const beats = [2.0, 6.5, 9.9, 12.5];

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function easeOut(value: number): number {
  return 1 - (1 - clamp01(value)) ** 3;
}

function line(x1: number, y1: number, x2: number, y2: number, stroke: string, width = 1, opacity = 1): LineNode {
  return new LineNode(x1, y1, x2, y2, { stroke, strokeWidth: width, opacity });
}

/** Rain on three depths; `boost` speeds everything up while the ball accelerates. */
function rain(t: number, boost: number): Node[] {
  const layers = [
    { count: 30, speed: 150, length: 20, alpha: 0.2, width: 1 },
    { count: 24, speed: 320, length: 46, alpha: 0.38, width: 1.4 },
    { count: 14, speed: 640, length: 92, alpha: 0.6, width: 2 },
  ];
  const nodes: Node[] = [];
  layers.forEach((layer, index) => {
    const random = seeded(1000 + index * 77);
    for (let i = 0; i < layer.count; i += 1) {
      const x = random() * (W + 80) - 40;
      const offset = random() * (H + layer.length);
      const y = ((t * layer.speed * boost + offset) % (H + layer.length * 2)) - layer.length;
      nodes.push(line(x, y, x - 6, y + layer.length, C.ink, layer.width, layer.alpha));
    }
  });
  return nodes;
}

function vignette(): Node[] {
  const nodes: Node[] = [];
  for (let i = 0; i < 4; i += 1) {
    const depth = i * 26 + 18;
    const alpha = 0.09 - i * 0.02;
    nodes.push(new RectNode(0, 0, W, depth, { fill: '#000000', opacity: alpha }));
    nodes.push(new RectNode(0, H - depth, W, depth, { fill: '#000000', opacity: alpha }));
    nodes.push(new RectNode(0, 0, depth, H, { fill: '#000000', opacity: alpha }));
    nodes.push(new RectNode(W - depth, 0, depth, H, { fill: '#000000', opacity: alpha }));
  }
  return nodes;
}

function grain(t: number): Node[] {
  const random = seeded(Math.round(t * 30) * 9973 + 7);
  const nodes: Node[] = [];
  for (let i = 0; i < 90; i += 1) {
    nodes.push(new CircleNode(random() * W, random() * H, 0.9, { fill: C.ink, opacity: 0.03 + random() * 0.04 }));
  }
  return nodes;
}

/** One action, one timeline: the ball falls from above the frame to the ground. */
function ballY(t: number): number {
  const progress = clamp01(t / IMPACT);
  return START + (GROUND - BALL_R - START) * progress ** 2;
}

function shake(t: number): Vector2 {
  if (t < IMPACT) return new Vector2(0, 0);
  const elapsed = t - IMPACT;
  const amplitude = 16 * Math.exp(-5.5 * elapsed);
  return new Vector2(Math.sin(elapsed * 61) * amplitude, Math.cos(elapsed * 47) * amplitude * 0.7);
}

function build(t: number): Node {
  const shot = t < 4.6 ? 1 : t < IMPACT ? 2 : 3;
  const world: Node[] = [];

  // Warm pool of light on the ground: a dozen rings fake a gradient without banding.
  for (let i = 12; i >= 1; i -= 1) {
    world.push(new CircleNode(BALL_X, GROUND + 10, i * 28, { fill: C.accent, opacity: 0.012 }));
  }

  // Far field: slow dots.
  const field = seeded(4001);
  for (let i = 0; i < 60; i += 1) {
    const x = field() * W;
    const y = (field() * H + t * 10) % H;
    world.push(new CircleNode(x, y, 1.3, { fill: C.muted, opacity: 0.3 }));
  }

  world.push(...rain(t, shot === 2 ? 1.3 : 1));

  world.push(line(0, GROUND, W, GROUND, C.ink, shot === 1 ? 1 : 1.5, shot === 1 ? 0.5 : 0.9));
  if (shot >= 2) {
    for (let x = 20; x < W; x += 42) world.push(line(x, GROUND + 2, x - 14, GROUND + 14, C.muted, 1, 0.4));
  }

  if (shot === 2) {
    const y = ballY(t);
    for (let i = 6; i >= 1; i -= 1) {
      world.push(
        new CircleNode(BALL_X, ballY(t - i * 0.04), BALL_R * (1 - i * 0.04), {
          fill: C.accent,
          opacity: 0.18 - i * 0.022,
        }),
      );
    }
    world.push(new CircleNode(BALL_X, y, BALL_R, { fill: C.accent }));
    world.push(new CircleNode(BALL_X - 6, y - 6, BALL_R * 0.4, { fill: '#FFFFFF', opacity: 0.24 }));
  }

  if (shot === 1) {
    const y = ballY(t);
    if (y > -20) {
      world.push(new CircleNode(BALL_X, y, 12, { fill: C.accent }));
      world.push(new CircleNode(BALL_X - 4, y - 4, 5, { fill: '#FFFFFF', opacity: 0.2 }));
    }
  }

  if (shot === 3) {
    const elapsed = t - IMPACT;
    const settle = elapsed < 0.5 ? Math.sin((elapsed / 0.5) * Math.PI) * 14 : 0;
    world.push(new CircleNode(BALL_X, GROUND - BALL_R - settle, BALL_R, { fill: C.accent }));
    world.push(new CircleNode(BALL_X - 6, GROUND - BALL_R - settle - 6, BALL_R * 0.4, { fill: '#FFFFFF', opacity: 0.22 }));

    [0, 0.1, 0.2].forEach((delay, index) => {
      const age = elapsed - delay;
      if (age <= 0) return;
      const opacity = Math.max(0, 0.4 - age * 0.55);
      if (opacity <= 0) return;
      world.push(new CircleNode(BALL_X, GROUND - BALL_R, age * (560 - index * 100), { stroke: C.accent, strokeWidth: 2, opacity }));
    });

    const dust = seeded(9001);
    for (let i = 0; i < 36; i += 1) {
      const angle = -Math.PI + dust() * Math.PI;
      const speed = 90 + dust() * 340;
      const life = 0.7 + dust() * 0.9;
      const radius = 1.4 + dust() * 1.8;
      const fill = dust() > 0.5 ? C.accent : C.ink;
      if (elapsed > life) continue;
      world.push(
        new CircleNode(
          BALL_X + Math.cos(angle) * speed * elapsed,
          GROUND - BALL_R + Math.sin(angle) * speed * elapsed + 260 * elapsed * elapsed,
          radius,
          { fill, opacity: Math.max(0, 0.5 - elapsed * 0.42) },
        ),
      );
    }
  }

  // Foreground: a dark lip at the bottom and fast rain closest to the lens.
  world.push(new RectNode(0, H - 46, W, 46, { fill: '#000000', opacity: 0.6 }));
  const near = seeded(555);
  for (let i = 0; i < 7; i += 1) {
    const x = near() * W;
    const y = ((t * 980 + near() * H) % (H + 220)) - 160;
    world.push(line(x, y, x - 10, y + 170, C.ink, 3, 0.18));
  }

  const cameraScale = shot === 1 ? 1.0 + 0.03 * clamp01(t / 4.6) : shot === 2 ? 1.12 + 0.02 * clamp01((t - 4.6) / 5.2) : 1.14 + 0.02 * clamp01((t - IMPACT) / 5);
  const follow = shot === 2 ? Math.max(0, (ballY(t) - 300) * 0.22) : 0;
  const offset = shake(t);

  const rig = new Node({
    translation: new Vector2(offset.x, -follow + offset.y),
    scale: cameraScale,
    children: [new Node({ children: world })],
  });

  if (shot === 2) {
    const band = new Node({ rotation: 0.3, translation: new Vector2(-320 + 1700 * easeOut((t - 4.6) / 3.6), -140) });
    band.addChild(new RectNode(0, 0, 190, H + 300, { fill: C.accent, opacity: 0.045 }));
    rig.addChild(band);
  }

  const overlay: Node[] = [...vignette(), ...grain(t)];
  const flash = shot === 3 ? Math.max(0, 0.55 - (t - IMPACT) * 5) : 0;
  if (flash > 0) overlay.push(new RectNode(0, 0, W, H, { fill: '#FFFFFF', opacity: flash }));

  const caption = shot === 3 ? clamp01((t - 11.4) / 0.6) : 0;
  if (caption > 0) {
    overlay.push(new TextNode('The fall ends. The speed does not.', 64, H - 74, { fontSize: 17, fill: C.muted, opacity: caption }));
  }

  return new Node({ children: [rig, ...overlay] });
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
