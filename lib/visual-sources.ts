/**
 * Her disiplin gorselinin dusuk seviye kurulum kodu.
 *
 * `DocDemo` Source sekmesinde bunlari gosterir. Kod iki dilde birebir aynidir; yorumlar
 * Ingilizce tutulur.
 */
export const visualSources: Record<string, string> = {
  'function-graph': `import { CoordinatePlane, FunctionPlotter, Node, PathNode, Shape, Vector2 } from '@medu/lerno';

const plane = new CoordinatePlane({ xRange: [-3, 3], yRange: [-6, 6], width: 480, height: 320, padding: 40 });
const plotter = new FunctionPlotter({ fn: (x) => x ** 3, domain: [-3, 3], samples: 120 });

// generatePath returns pixel points; Shape.polyline turns them into a path
const { points } = plotter.generatePath(plane);
const curve = new PathNode(
  Shape.polyline(points.map((p) => new Vector2(p.px, p.py))),
  { stroke: 'var(--accent)', strokeWidth: 2, fill: 'none' },
);

const scene = new Node({ children: [curve] });`,

  triangle: `import { CoordinatePlane, Node, PathNode, Shape, TextNode, Vector2 } from '@medu/lerno';

const plane = new CoordinatePlane({ xRange: [-1, 6], yRange: [-1, 4], width: 480, height: 320, padding: 40 });
const a = new Vector2(0, 0);
const b = new Vector2(sideA * Math.cos(angle), sideA * Math.sin(angle));
const c = new Vector2(sideB, 0);

// model units are mapped to pixels once, then the polygon is built
const toPixel = (v: Vector2) => new Vector2(plane.toPixels(v.x, v.y).px, plane.toPixels(v.x, v.y).py);
const triangle = new PathNode(Shape.polygon([toPixel(a), toPixel(b), toPixel(c)]), {
  fill: 'var(--accent-soft)',
  stroke: 'var(--accent)',
  strokeWidth: 2,
});

const scene = new Node({ children: [triangle] });`,

  'unit-circle': `import { CircleNode, CoordinatePlane, LineNode, Node, Property } from '@medu/lerno';

const plane = new CoordinatePlane({ xRange: [-1.6, 1.6], yRange: [-1.6, 1.6], width: 480, height: 320, padding: 40 });
const angle = new Property(Math.PI / 4); // model state, the view reads it

function build(angle: number) {
  const center = plane.toPixels(0, 0);
  const tip = plane.toPixels(Math.cos(angle), Math.sin(angle));

  return new Node({
    children: [
      new CircleNode(center.px, center.py, Math.abs(plane.toPixels(1, 0).px - center.px), { fill: 'none', stroke: 'var(--border)' }),
      new LineNode(center.px, center.py, tip.px, tip.py, { stroke: 'var(--accent)', strokeWidth: 2 }),
      new CircleNode(tip.px, tip.py, 5, { fill: 'var(--accent)' }),
    ],
  });
}`,

  solid: `import { LineNode, Node, Vector2 } from '@medu/lerno';

// A cube is eight vertices; project them and draw the twelve edges
const vertices: Vector2[] = [];
for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) {
  const scale = 1 / (1 + z * 0.35); // simple perspective
  vertices.push(new Vector2(240 + x * 70 * scale, 160 + y * 70 * scale));
}

const edges = [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
const lines = edges.map(([i, j]) => new LineNode(vertices[i].x, vertices[i].y, vertices[j].x, vertices[j].y, { stroke: 'var(--accent)' }));

const scene = new Node({ children: lines });`,

  distribution: `import { CoordinatePlane, Node, PathNode, Shape, Vector2 } from '@medu/lerno';

const plane = new CoordinatePlane({ xRange: [-4, 4], yRange: [0, 0.45], width: 480, height: 320, padding: 40 });
const pdf = (x: number) => Math.exp(-(x * x) / 2) / Math.sqrt(2 * Math.PI);

const points = Array.from({ length: 120 }, (_, i) => {
  const x = -4 + (8 * i) / 119;
  return plane.toPixels(x, pdf(x));
});

// Area fill: close the curve along the baseline
const area = Shape.polygon([
  new Vector2(plane.toPixels(-4, 0).px, plane.toPixels(-4, 0).py),
  ...points.map((p) => new Vector2(p.px, p.py)),
  new Vector2(plane.toPixels(4, 0).px, plane.toPixels(4, 0).py),
]);

const scene = new Node({ children: [new PathNode(area, { fill: 'var(--accent-soft)', stroke: 'var(--accent)' })] });`,

  chart: `import { CoordinatePlane, Node, RectNode, TextNode } from '@medu/lerno';

const plane = new CoordinatePlane({ xRange: [0, labels.length], yRange: [0, 100], width: 480, height: 320, padding: 40 });
const max = Math.max(...values);

const bars = values.map((value, i) => {
  const height = (value / max) * (plane.height - 2 * plane.padding);
  const x = plane.toPixels(i + 0.15, 0).px;
  const y = plane.toPixels(i + 0.85, 0).py - height;
  const label = new TextNode(labels[i], x + 12, plane.toPixels(0, 0).py + 16, { fontSize: 12, anchor: 'middle' });
  return new Node({ children: [new RectNode(x, y, 24, height, { fill: 'var(--accent)', radius: 4 }), label] });
});

const scene = new Node({ children: bars });`,

  sorting: `import { Node, Property, RectNode } from '@medu/lerno';

const values = new Property<number[]>([5, 2, 9, 1, 6, 3]);
const width = 40;

function render(values: number[]) {
  const max = Math.max(...values);
  const bars = values.map((value, i) => {
    const height = (value / max) * 200;
    return new RectNode(40 + i * (width + 8), 280 - height, width, height, { fill: 'var(--accent)', radius: 4 });
  });
  // one array, one tree: every algorithm step mutates the array and the view rebuilds
  return new Node({ children: bars });
}`,

  'solids-3d': `import { box, sphere, cylinder, VariableStore } from '@medu/lerno-three';

const store = new VariableStore();
store.defineNumber('spin', 0);

const scene = {
  camera: [0, 1.5, 6],
  objects: [
    box({ width: 1.3, height: 1.3, depth: 1.3 }, { color: '#42a5f5' }, { position: [-3, 0, 0], bindings: { 'rotation.y': 'spin' } }),
    sphere(0.8, { color: '#10b981' }, { position: [-1.5, 0, 0], bindings: { 'rotation.y': 'spin' } }),
    cylinder(0.6, 1.6, { color: '#f59e0b' }, { position: [0, 0, 0], bindings: { 'rotation.y': 'spin' } }),
  ],
};

// <ThreeCanvas scene={scene} store={store} />`,

  surface: `import { surface } from '@medu/lerno-three';

// z = f(u, v): a radial ripple
const mesh = surface(
  (u, v) => Math.sin(Math.hypot(u, v) * 2) * 1.8,
  { uSegments: 48, vSegments: 48, uRange: [-3, 3], vRange: [-3, 3], colorLow: '#1d4ed8', colorHigh: '#f472b6' },
  { metalness: 0.15, roughness: 0.55 },
);

// Add the mesh to the scene; the runtime builds the BufferGeometry from it`,

  projectile: `import { CoordinatePlane, Node, Property } from '@medu/lerno';

const plane = new CoordinatePlane({ xRange: [0, 120], yRange: [0, 60], width: 480, height: 320, padding: 40 });
const vx = new Property(v0 * Math.cos((angleDeg * Math.PI) / 180));
const vy = new Property(v0 * Math.sin((angleDeg * Math.PI) / 180));

function step(dt: number, model: { x: number; y: number }) {
  model.x += vx.get() * dt;
  model.y += vy.get() * dt;
  vy.set(vy.get() - g * dt); // gravity is applied to the model, never to the view
}`,

  pendulum: `import { CircleNode, LineNode, Node, Property } from '@medu/lerno';

const angle = new Property(0.6);
const pivotX = 240;
const pivotY = 40;

function render(angle: number) {
  const bobX = pivotX + Math.sin(angle) * 120;
  const bobY = pivotY + Math.cos(angle) * 120;
  return new Node({ children: [
    new LineNode(pivotX, pivotY, bobX, bobY, { stroke: 'var(--muted)', strokeWidth: 2 }),
    new CircleNode(bobX, bobY, 12, { fill: 'var(--accent)' }),
  ] });
}`,

  wave: `import { CoordinatePlane, Node, PathNode, Shape, Vector2 } from '@medu/lerno';

const plane = new CoordinatePlane({ xRange: [0, 4 * Math.PI], yRange: [-1.4, 1.4], width: 480, height: 320, padding: 40 });
const y = (x: number) => amplitude * Math.sin(((2 * Math.PI) / wavelength) * x - frequency * t);

const points = Array.from({ length: samples }, (_, i) => {
  const x = (4 * Math.PI * i) / (samples - 1);
  const p = plane.toPixels(x, y(x));
  return new Vector2(p.px, p.py);
});

const scene = new Node({ children: [new PathNode(Shape.polyline(points), { stroke: 'var(--accent)', strokeWidth: 2, fill: 'none' })] });`,

  orbit: `import { CircleNode, Node } from '@medu/lerno';

// Each body moves on a circle; its position comes from the period alone
const bodies = planets.map((planet) => {
  const theta = (2 * Math.PI * t) / planet.period;
  return new CircleNode(240 + Math.cos(theta) * planet.radius * 50, 160 + Math.sin(theta) * planet.radius * 50, 6, { fill: planet.color });
});

const scene = new Node({ children: [new CircleNode(240, 160, 14, { fill: '#fbbf24' }), ...bodies] });`,

  molecule: `import { CircleNode, LineNode, Node } from '@medu/lerno';

// The molecule holds atoms and bonds; the view only reads its geometry
const bonds = molecule.bonds.map((bond) => new LineNode(bond.from.x, bond.from.y, bond.to.x, bond.to.y, { stroke: 'var(--border)', strokeWidth: 3 }));
const atoms = molecule.atoms.map((atom) => new CircleNode(atom.x, atom.y, 14, { fill: atom.color, stroke: 'var(--background)' }));

const scene = new Node({ children: [...bonds, ...atoms] });`,

  'bohr-atom': `import { CircleNode, Node } from '@medu/lerno';

// Shells are concentric circles; electrons sit on them by shell index
const shells = configuration.map((count, shell) => {
  const radius = 40 + shell * 34;
  const ring = new CircleNode(240, 160, radius, { fill: 'none', stroke: 'var(--border)' });
  const electrons = Array.from({ length: count }, (_, i) => {
    const theta = (2 * Math.PI * i) / count;
    return new CircleNode(240 + Math.cos(theta) * radius, 160 + Math.sin(theta) * radius, 5, { fill: 'var(--accent)' });
  });
  return new Node({ children: [ring, ...electrons] });
});

const scene = new Node({ children: [new CircleNode(240, 160, 18, { fill: 'var(--accent)' }), ...shells] });`,

  'vsepr-3d': `import { sphere, VariableStore } from '@medu/lerno-three';

const store = new VariableStore();

// Ligands are placed on the sphere at fixed angular positions
const scene = {
  camera: [0, 0, 5],
  objects: [
    sphere(0.45, { color: '#94a3b8' }, { position: [0, 0, 0] }), // central atom
    ...ligands.flatMap((position) => [
      sphere(0.28, { color: '#3b82f6' }, { position }),
      // A bond stick needs its local Y axis aligned to the bond direction:
      // a quaternion on the three side, not a binding. See the 3D scene page.
    ]),
  ],
};`,

  dna: `import { CircleNode, LineNode, Node } from '@medu/lerno';

// Two strands are phase-shifted sines; base pairs join them
const strandA = (i: number) => 200 + Math.sin(i * 0.6) * 60;
const strandB = (i: number) => 200 + Math.sin(i * 0.6 + Math.PI) * 60;

const nodes = Array.from({ length: pairs }, (_, i) => {
  const y = 40 + i * spacing;
  return new Node({ children: [
    new CircleNode(strandA(i), y, 6, { fill: 'var(--accent)' }),
    new CircleNode(strandB(i), y, 6, { fill: 'var(--success)' }),
    new LineNode(strandA(i), y, strandB(i), y, { stroke: 'var(--border)' }),
  ] });
});

const scene = new Node({ children: nodes });`,

  punnett: `import { Node, RectNode, TextNode } from '@medu/lerno';

// A 2x2 cross: header row and column, then the cell combinations
const cell = 60;
const grid = [0, 1].flatMap((row) => [0, 1].map((col) => {
  const x = 100 + col * cell;
  const y = 80 + row * cell;
  const allele = parent1[col] + parent2[row];
  const homozygous = allele[0] === allele[1];
  const tone = homozygous ? 'var(--accent-soft)' : 'transparent';
  return new Node({ children: [
    new RectNode(x, y, cell, cell, { fill: tone, stroke: 'var(--border)' }),
    new TextNode(allele, x + cell / 2, y + cell / 2, { anchor: 'middle', baseline: 'middle' }),
  ] });
}));

const scene = new Node({ children: grid });`,

  cell: `import { CircleNode, Node, RectNode, TextNode } from '@medu/lerno';

// The outline is the cell membrane; organelles are placed inside it
const organelles = parts.map((part) => new CircleNode(part.x, part.y, part.radius, { fill: part.color }));
const labels = parts.map((part) => new TextNode(part.label, part.x, part.y - part.radius - 6, { fontSize: 11, anchor: 'middle' }));
const wall = kind === 'plant' ? new RectNode(40, 40, 400, 240, { fill: 'none', stroke: 'var(--success)', strokeWidth: 6, radius: 24 }) : null;

const scene = new Node({ children: [wall, new CircleNode(240, 160, 130, { fill: 'var(--accent-soft)' }), ...organelles, ...labels].filter(Boolean) });`,

  'dna-3d': `import { VariableStore } from '@medu/lerno-three';

const store = new VariableStore();
store.defineNumber('turn', 0);

// The helix is two point lists; base pairs connect them
const strandA = Array.from({ length: pairs }, (_, i) => [
  Math.cos((i * Math.PI) / 4) * 1.6,
  i * 0.4 - 2,
  Math.sin((i * Math.PI) / 4) * 1.6,
]);
const strandB = strandA.map(([x, y, z]) => [-x, y, -z]);

// 'turn' is bound to the group, so one variable rotates the whole helix`,

  climograph: `import { CoordinatePlane, Node, RectNode } from '@medu/lerno';

// Precipitation on the left axis, temperature drawn as a polyline above it
const plane = new CoordinatePlane({ xRange: [0, 12], yRange: [0, 1], width: 480, height: 320, padding: 40 });
const maxRain = Math.max(...precipitation);

const bars = precipitation.map((mm, i) => {
  const height = (mm / maxRain) * (plane.height - 2 * plane.padding);
  return new RectNode(plane.toPixels(i + 0.2, 0).px, plane.toPixels(i + 0.8, 0).py - height, 18, height, {
    fill: 'var(--accent-soft)',
  });
});

const scene = new Node({ children: bars });`,

  'map-coordinates': `import { CircleNode, ImageNode, Node, TextNode } from '@medu/lerno';

// Project lat/lon into the image box
function project(lat: number, lon: number) {
  return { x: ((lon + 180) / 360) * width, y: ((90 - lat) / 180) * height };
}

const markers = cities.map((city) => {
  const { x, y } = project(city.lat, city.lon);
  return new Node({ children: [
    new CircleNode(x, y, 6, { fill: 'var(--accent)', stroke: '#fff' }),
    new TextNode(city.name, x, y - 12, { fontSize: 12, anchor: 'middle' }),
  ] });
});

const scene = new Node({ children: [new ImageNode(mapSrc, 0, 0, width, height), ...markers] });`,

  'water-cycle': `import { CircleNode, Node, PathNode, Shape, TextNode } from '@medu/lerno';

// Stages are placed around a loop; an animated drop travels the same path
const labels = ['Buharlaşma', 'Yoğuşma', 'Yağış', 'Toplanma'];
const stages = labels.map((label, i) => {
  const angle = (i / labels.length) * 2 * Math.PI;
  const x = 240 + Math.cos(angle) * 150;
  const y = 160 + Math.sin(angle) * 90;
  return new Node({ children: [
    new CircleNode(x, y, 26, { fill: 'var(--accent-soft)' }),
    new TextNode(label, x, y, { fontSize: 11, anchor: 'middle', baseline: 'middle' }),
  ] });
});
const loop = new PathNode(Shape.circle(240, 160, 130), { fill: 'none', stroke: 'var(--border)', strokeDasharray: '4 6' });

const scene = new Node({ children: [loop, ...stages] });`,

  morphology: `import { Node, RectNode, TextNode } from '@medu/lerno';

// Root and suffixes are boxes on a row joined by connectors
let cursor = 40;
const parts = segments.map((segment) => {
  const width = segment.text.length * 12 + 20;
  const box = new RectNode(cursor, 80, width, 48, {
    fill: segment.kind === 'root' ? 'var(--accent-soft)' : 'var(--background)',
    stroke: 'var(--border)',
    radius: 8,
  });
  const text = new TextNode(segment.text, cursor + width / 2, 104, { anchor: 'middle', baseline: 'middle' });
  cursor += width + 16;
  return new Node({ children: [box, text] });
});

const scene = new Node({ children: parts });`,

  'syntax-tree': `import { LineNode, Node, TextNode } from '@medu/lerno';

// Lay the leaves out evenly, then center each parent over its children
const positions = new Map<string, { x: number; y: number }>();
const stride = width / (leaves.length + 1);
leaves.forEach((leaf, i) => positions.set(leaf.id, { x: stride * (i + 1), y: depth * 64 }));

function place(node: TreeNode): number {
  if (!node.children?.length) return positions.get(node.id)!.x;
  const xs = node.children.map(place);
  const x = (Math.min(...xs) + Math.max(...xs)) / 2;
  positions.set(node.id, { x, y: (depth - node.level) * 64 });
  return x;
}

// Edges are LineNode between parent and child positions; labels are TextNode`,
};
