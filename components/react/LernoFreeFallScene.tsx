'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Maximize2, Minimize2, Pause, Play, RotateCcw } from 'lucide-react';
import {
  CircleNode,
  CoordinatePlane,
  LineNode,
  Node,
  PathNode,
  RectNode,
  Shape,
  TextNode,
  defineDocument,
  v2,
  type MultipleChoiceItem,
} from '@medu/lerno';
import {
  Display,
  QuestionView,
  Readout,
  Select,
  Slider,
  Switch,
  useLessonStage,
} from '@medu/lerno-react';

const W = 960;
const H = 540;
const H0 = 45;
const GROUND = 470;
const TOP = 90;
const SCALE = (GROUND - TOP) / H0;

const C = {
  paper: '#FAF8F1',
  ink: '#1B241F',
  muted: '#6F7369',
  line: '#E1DCCD',
  olive: '#6E6C22',
  oliveDeep: '#52511A',
  oliveSoft: '#EDEBCF',
  amber: '#C08A24',
  green: '#0D3B2E',
  greenDeep: '#082A20',
  creme: '#F5F0DF',
  teal: '#7FA9A0',
} as const;

const LIGHT_TOKENS = {
  '--foreground': '#18181b',
  '--color-foreground': '#18181b',
  '--muted': '#71717a',
  '--color-muted': '#71717a',
  '--surface': '#ffffff',
  '--color-surface': '#ffffff',
  '--default': '#f4f4f5',
  '--color-default': '#f4f4f5',
  '--border': '#e4e4e7',
  '--color-border': '#e4e4e7',
  '--primary': '#6E6C22',
  '--color-primary': '#6E6C22',
  '--primary-foreground': '#F5F0DF',
  '--color-primary-foreground': '#F5F0DF',
} as CSSProperties;

interface Chapter {
  id: string;
  title: string;
  duration: number;
}

const CHAPTERS: Chapter[] = [
  { id: 'ivme', title: 'Yerçekimi ivmesi', duration: 6 },
  { id: 'kutle', title: 'Kütle bağımsızlığı', duration: 7 },
  { id: 'model', title: 'Matematiksel model', duration: 6 },
  { id: 'soru', title: 'Soru', duration: 0 },
];

const STARTS = CHAPTERS.map((_, index) => CHAPTERS.slice(0, index).reduce((sum, chapter) => sum + chapter.duration, 0));
const FILM_END = STARTS[3];

const BALLS = [
  { id: '5g', label: '5 g', radius: 8, color: '#C08A24', terminal: 10 },
  { id: '500g', label: '500 g', radius: 11, color: '#C4663A', terminal: 17 },
  { id: '5kg', label: '5 kg', radius: 14, color: '#33403A', terminal: 26 },
];

const QUESTION: MultipleChoiceItem = {
  kind: 'multiple-choice',
  prompt:
    'K topu h yüksekliğinden serbest bırakılıyor. L topu aynı anda v hızıyla yukarı atılıyor. Toplar yere aynı anda düştüğüne göre K topu kaç h yüksekliğinden bırakılmıştır?',
  multiple: false,
  choices: [
    { id: 'a', label: '2h', misconception: 'Yalnızca yükselme süresini hesaba kattın.' },
    { id: 'b', label: '3h', misconception: 'L topunun dönüş süresini eklemedin.' },
    { id: 'c', label: '4h' },
    { id: 'd', label: '5h', misconception: 'Karesel oranı bir adım fazla büyüttün.' },
  ],
  correct: ['c'],
};

function heightAt(t: number, g: number, air: boolean, terminal: number, v0 = 0): number {
  if (!air) return Math.max(0, H0 - v0 * t - 0.5 * g * t * t);
  return Math.max(0, H0 - ((terminal * terminal) / g) * Math.log(Math.cosh((g * t) / terminal)));
}

function speedAt(t: number, g: number, air: boolean, terminal: number, v0 = 0): number {
  if (!air) return Math.min(v0 + g * t, Math.sqrt(v0 * v0 + 2 * g * H0));
  return terminal * Math.tanh((g * t) / terminal);
}

function fmt(value: number, digits = 1): string {
  return value.toLocaleString('tr-TR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function clock(value: number): string {
  const whole = Math.floor(value);
  const tenth = Math.floor((value - whole) * 10);
  return `0:${whole.toString().padStart(2, '0')}.${tenth}`;
}

function text(value: string, x: number, y: number, size = 14, fill: string = C.ink, extra: { weight?: number; anchor?: 'start' | 'middle' | 'end' } = {}): TextNode {
  return new TextNode(value, x, y, { fontSize: size, fill, fontWeight: extra.weight, anchor: extra.anchor });
}

function rect(x: number, y: number, width: number, height: number, fill: string, radius = 0): RectNode {
  return new RectNode(x, y, width, height, { fill, radius });
}

function line(x1: number, y1: number, x2: number, y2: number, stroke: string, width = 1, dash?: string): LineNode {
  return new LineNode(x1, y1, x2, y2, { stroke, strokeWidth: width, dash });
}

function arrow(x1: number, y1: number, x2: number, y2: number, stroke: string): Node {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 8;
  const shape = new Shape()
    .moveTo(x2, y2)
    .lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6))
    .moveTo(x2, y2)
    .lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
  return new Node({ children: [line(x1, y1, x2, y2, stroke, 2), new PathNode(shape, { stroke, strokeWidth: 2 })] });
}

function chrome(kicker: string, title: string): Node {
  return new Node({
    children: [
      text(kicker, 30, 36, 10, C.olive, { weight: 700 }),
      text(title.toLocaleUpperCase('tr-TR'), 62, 36, 11, C.muted, { weight: 600 }),
      line(30, 48, 650, 48, C.line),
    ],
  });
}

function ground(): Node {
  const children: Node[] = [line(40, GROUND, 660, GROUND, C.ink, 2)];
  for (let index = 0; index < 20; index += 1) {
    const x = 46 + index * 32;
    children.push(line(x, GROUND + 2, x - 10, GROUND + 14, C.line, 2));
  }
  return new Node({ children });
}

function ruler(showLabels = true): Node {
  const children: Node[] = [line(120, TOP, 120, GROUND, C.line, 1)];
  for (let height = 0; height <= H0; height += 5) {
    const y = GROUND - height * SCALE;
    children.push(line(112, y, 124, y, C.muted));
    if (showLabels && height % 10 === 0) children.push(text(`${height} m`, 102, y + 4, 10, C.muted, { anchor: 'end' }));
  }
  return new Node({ children });
}

interface SceneInput {
  chapter: number;
  local: number;
  g: number;
  air: boolean;
  mass: number;
  v0: number;
}

function gravityScene({ local, g, mass }: SceneInput): Node {
  const state = { h: heightAt(local, g, false, 26), v: speedAt(local, g, false, 26) };
  const ballY = GROUND - state.h * SCALE;
  const selected = BALLS.reduce((closest, ball) =>
    Math.abs(ball.radius - mass / 400) < Math.abs(closest.radius - mass / 400) ? ball : closest,
  );
  const children: Node[] = [
    chrome('01', 'Yerçekimi ivmesi'),
    ground(),
    ruler(),
    text('g = 9,76 m/s²', 350, 150, 25),
    text('ekvator', 350, 176, 12, C.muted),
    text('g = 9,83 m/s²', 350, 222, 25),
    text('kutup', 350, 248, 12, C.muted),
    new CircleNode(270, ballY, selected.radius, { fill: selected.color }),
    new CircleNode(270 - selected.radius * 0.3, ballY - selected.radius * 0.35, selected.radius * 0.3, { fill: '#FFFFFF', opacity: 0.35 }),
    text(`h = ${fmt(state.h)} m`, 330, (ballY + GROUND) / 2, 13, C.oliveDeep, { weight: 600 }),
    line(314, ballY, 314, GROUND, C.olive, 1, '4 4'),
    arrow(270, 330, 270, 400, C.olive),
    text(`g = ${g} m/s²`, 286, 350, 12, C.oliveDeep, { weight: 600 }),
  ];

  for (let index = 1; index <= 5; index += 1) {
    const past = local - index * 0.09;
    if (past < 0) continue;
    const y = GROUND - heightAt(past, g, false, 26) * SCALE;
    children.push(new CircleNode(270, y, selected.radius * 0.55, { fill: selected.color, opacity: 0.2 - index * 0.025 }));
  }

  if (state.h <= 0.01) {
    children.push(rect(370, 410, 260, 32, C.olive, 16));
    children.push(text(`Yere ulaştı · t = ${fmt(Math.sqrt((2 * H0) / g), 2)} s`, 500, 431, 11, C.creme, { anchor: 'middle', weight: 600 }));
  }

  return new Node({ children });
}

function massScene({ local, g, air, mass }: SceneInput): Node {
  const lanes = [220, 400, 580];
  const children: Node[] = [chrome('02', 'Kütle bağımsızlığı'), ground()];
  const selected = BALLS.reduce((closest, ball) =>
    Math.abs(ball.radius - mass / 400) < Math.abs(closest.radius - mass / 400) ? ball : closest,
  );

  BALLS.forEach((ball, index) => {
    const x = lanes[index];
    const height = heightAt(local, g, air, ball.terminal);
    const y = GROUND - height * SCALE;
    const highlight = ball.id === selected.id;
    children.push(line(x, TOP, x, GROUND, C.line, 1, '3 6'));
    children.push(text(ball.label, x, 82, 12, highlight ? C.ink : C.muted, { anchor: 'middle', weight: highlight ? 700 : 500 }));
    children.push(new CircleNode(x, y, ball.radius, { fill: ball.color, opacity: highlight ? 1 : 0.68 }));
    children.push(new CircleNode(x - ball.radius * 0.3, y - ball.radius * 0.35, ball.radius * 0.3, { fill: '#FFFFFF', opacity: 0.35 }));
    children.push(text(`${fmt(height)} m`, x, GROUND + 34, 10, height <= 0.01 ? C.olive : C.muted, { anchor: 'middle', weight: 600 }));
  });

  children.push(text(air ? 'hava direnci açık' : 'vakum', 30, 70, 11, C.muted));
  children.push(text(`${g} m/s²`, 620, 70, 11, C.muted, { anchor: 'end' }));

  return new Node({ children });
}

function chart(
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  unit: string,
  color: string,
  sample: (time: number) => number,
  tEnd: number,
  playhead: number,
): Node {
  const plane = new CoordinatePlane({ width, height, padding: 30, xRange: [0, 4], yRange: [0, 50], stepX: 1, stepY: 10 });
  const { gridLines, ticks, xAxis, yAxis } = plane.renderSvgElements();
  const children: Node[] = [
    rect(0, 0, width, height, '#FFFFFF', 16),
    new RectNode(0, 0, width, height, { fill: 'transparent', stroke: C.line, strokeWidth: 1, radius: 16 }),
    text(title.toLocaleUpperCase('tr-TR'), 16, 22, 9, C.muted, { weight: 700 }),
    text(unit, width - 14, 22, 9, C.muted, { anchor: 'end' }),
  ];

  for (const grid of gridLines) children.push(line(grid.x1, grid.y1, grid.x2, grid.y2, C.line, 1, '3 5'));
  children.push(line(xAxis.x1, xAxis.y1, xAxis.x2, xAxis.y2, C.muted, 1));
  children.push(line(yAxis.x1, yAxis.y1, yAxis.x2, yAxis.y2, C.muted, 1));
  for (const tick of ticks) {
    if (tick.axis === 'y' && Number(tick.label) % 10 !== 0) continue;
    children.push(text(tick.label, tick.px, tick.py, 8, C.muted, { anchor: 'middle' }));
  }

  const full = new Shape();
  const current = Math.min(playhead, tEnd);
  for (let time = 0; time <= tEnd + 0.0001; time += 0.02) {
    const point = plane.toPixels(time, sample(time));
    if (time === 0) full.moveTo(point.px, point.py);
    else full.lineTo(point.px, point.py);
  }
  children.push(new PathNode(full, { stroke: color, strokeWidth: 2.2, fill: 'none', opacity: 0.3 }));

  const partial = new Shape();
  for (let time = 0; time <= current + 0.0001; time += 0.02) {
    const point = plane.toPixels(time, sample(time));
    if (time === 0) partial.moveTo(point.px, point.py);
    else partial.lineTo(point.px, point.py);
  }
  children.push(new PathNode(partial, { stroke: color, strokeWidth: 3, fill: 'none' }));

  const head = plane.toPixels(current, sample(current));
  children.push(line(head.px, plane.toPixels(0, 0).py, head.px, head.py, color, 1, '3 4'));
  children.push(new CircleNode(head.px, head.py, 4, { fill: color }));

  return new Node({ translation: v2(x, y), children });
}

function modelScene({ local, g, v0 }: SceneInput): Node {
  const tEnd = Math.min(4, (-v0 + Math.sqrt(v0 * v0 + 2 * g * H0)) / g);
  const t = Math.min(local, tEnd);
  const height = Math.max(0, H0 - v0 * t - 0.5 * g * t * t);

  return new Node({
    children: [
      chrome('03', 'Matematiksel model'),
      chart(20, 76, 310, 300, 'Yükseklik – zaman', 'm', C.olive, (time) => Math.max(0, H0 - v0 * time - 0.5 * g * time * time), tEnd, t),
      chart(350, 76, 310, 300, 'Hız – zaman', 'm/s', C.amber, (time) => v0 + g * time, tEnd, t),
      rect(20, 402, 640, 78, C.oliveSoft, 14),
      text('MODEL', 40, 426, 9, C.muted, { weight: 700 }),
      text(`h = ${v0 > 0 ? `${v0} · t + ` : ''}½ · g · t²`, 40, 452, 15),
      text(`v = ${v0 > 0 ? `${v0} + ` : ''}g · t`, 340, 452, 15),
      text(`h = ${fmt(height)} m`, 640, 426, 15, C.oliveDeep, { anchor: 'end', weight: 600 }),
    ],
  });
}

function questionScene({ local }: SceneInput): Node {
  const solution = local > 4;
  return new Node({
    children: [
      rect(0, 0, W, H, C.green),
      rect(0, 0, W, 8, C.amber),
      rect(30, 26, 46, 26, C.amber, 5),
      text('?', 53, 46, 15, C.greenDeep, { anchor: 'middle', weight: 800 }),
      text('SORU', 88, 46, 14, C.creme, { weight: 700 }),
      text('K topu h yüksekliğinden serbest bırakılıyor.', 30, 120, 20, C.creme),
      text('L topu aynı anda v hızıyla yukarı atılıyor.', 30, 152, 20, C.creme),
      text('Toplar yere aynı anda düştüğüne göre K topu', 30, 202, 14, '#CFD9D2'),
      text('kaç h yüksekliğinden bırakılmıştır?', 30, 226, 14, '#CFD9D2'),
      line(540, 110, 540, 430, '#3F6557', 1, '4 6'),
      line(440, 430, 650, 430, C.creme, 2),
      new CircleNode(540, 170, 11, { fill: C.amber }),
      text('K', 560, 175, 12, C.creme, { weight: 600 }),
      arrow(540, 184, 540, 400, C.amber),
      new CircleNode(460, 210, 7, { fill: C.amber }),
      text('L', 478, 206, 12, C.creme, { weight: 600 }),
      new PathNode(
        new Shape()
          .moveTo(460, 430)
          .quadraticCurveTo(404, 300, 460, 210)
          .quadraticCurveTo(516, 300, 460, 430),
        { stroke: C.creme, strokeWidth: 2, fill: 'none', dash: '5 5' },
      ),
      text('h', 410, 300, 12, C.creme, { anchor: 'end' }),
      solution
        ? text('L: 2v/g · K: √(2H/g) → H = 4h', 30, 300, 15, C.amber, { weight: 600 })
        : text('İpucu: iki topun yere varış sürelerini eşitle.', 30, 300, 12, '#B9D8C9'),
    ],
  });
}

function buildScene(input: SceneInput): Node {
  const children: Node[] = [rect(0, 0, W, H, C.paper)];
  if (input.chapter === 0) children.push(gravityScene(input));
  else if (input.chapter === 1) children.push(massScene(input));
  else if (input.chapter === 2) children.push(modelScene(input));
  else children.push(questionScene(input));
  return new Node({ children });
}

export function LernoFreeFallScene() {
  const lessonDocument = useMemo(
    () =>
      defineDocument({
        schemaVersion: 1,
        id: 'serbest-dusme-film',
        type: 'lesson',
        metadata: { title: 'Serbest Düşme', subject: 'Fizik', grade: 11 },
        variables: {
          airOn: { type: 'boolean', initial: false },
          g: { type: 'number', initial: 10, enum: [9.8, 10] },
          mass: { type: 'number', initial: 500 },
          v0: { type: 'number', initial: 0 },
        },
        nodes: [
          { id: 'film', type: 'custom', extension: 'lerno', kind: 'freefall', data: {} },
          { id: 'k-l', type: 'question', item: QUESTION, points: 1 },
        ],
      }),
    [],
  );

  const { stage, timeMs, sessionState, setVariable } = useLessonStage(lessonDocument, {
    durationMs: FILM_END * 1000,
    fps: 60,
  });

  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [cinema, setCinema] = useState(false);
  const playerRef = useRef<HTMLDivElement | null>(null);

  const time = timeMs / 1000;
  const g: '10' | '9.8' = sessionState.variables.g === 9.8 ? '9.8' : '10';
  const air = sessionState.variables.airOn === true;
  const mass = typeof sessionState.variables.mass === 'number' ? sessionState.variables.mass : 500;
  const v0 = typeof sessionState.variables.v0 === 'number' ? sessionState.variables.v0 : 0;
  const setG = (value: '10' | '9.8') => setVariable('g', value === '9.8' ? 9.8 : 10);
  const setAir = (value: boolean) => setVariable('airOn', value);
  const setMass = (value: number) => setVariable('mass', value);
  const setV0 = (value: number) => setVariable('v0', value);

  const chapter = STARTS.reduce((found, start, index) => (time >= start ? index : found), 0);
  const local = Math.max(0, Math.min(CHAPTERS[chapter].duration || FILM_END, time - STARTS[chapter]));
  const numericG = g === '10' ? 10 : 9.8;
  const outcome = sessionState.answers['k-l']?.outcome;

  useEffect(() => {
    if (!playing || chapter === 3) return;
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const delta = Math.min(0.05, (now - last) / 1000) * speed;
      last = now;
      stage.advance(delta * 1000);
      if (stage.getState().timeMs >= FILM_END * 1000) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, chapter, stage]);

  const scene = useMemo(
    () => buildScene({ chapter, local, g: numericG, air, mass, v0 }),
    [chapter, local, numericG, air, mass, v0],
  );

  const progress = Math.min(1, time / FILM_END);

  useEffect(() => {
    if (!cinema) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCinema(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [cinema]);

  function seek(next: number): void {
    stage.seek(Math.max(0, Math.min(FILM_END, next)) * 1000);
    setPlaying(false);
  }

  function jump(index: number): void {
    stage.seek(STARTS[index] * 1000);
    setPlaying(index !== 3);
  }

  function togglePlay(): void {
    if (chapter === 3 || time >= FILM_END) {
      stage.seek(0);
      setPlaying(true);
      return;
    }
    setPlaying((value) => !value);
  }

  const rows =
    chapter === 0
      ? [
          { label: 'Yükseklik', value: `${fmt(heightAt(local, numericG, false, 26))} m` },
          { label: 'Hız', value: `${fmt(speedAt(local, numericG, false, 26))} m/s` },
          { label: 'İvme', value: `${numericG} m/s²` },
          { label: 'Süre', value: `${fmt(local, 2)} s` },
        ]
      : chapter === 1
        ? [
            { label: 'Hava', value: air ? 'Açık' : 'Kapalı' },
            { label: 'g', value: numericG },
            { label: 'Kütle', value: `${mass} g` },
            { label: 'Süre', value: `${fmt(local, 2)} s` },
          ]
        : [
            { label: 'İlk hız', value: `${v0} m/s` },
            { label: 'Yükseklik', value: `${fmt(Math.max(0, H0 - v0 * local - 0.5 * numericG * local * local))} m` },
            { label: 'Hız', value: `${fmt(v0 + numericG * local)} m/s` },
            { label: 'Süre', value: `${fmt(local, 2)} s` },
          ];

  return (
    <div className="light min-h-screen w-full" style={{ ...LIGHT_TOKENS, background: '#faf8f1', color: '#18181b', colorScheme: 'light' }}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-200 pb-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Fizik · 11. Sınıf · Lerno sahnesi
            </span>
            <h1 className="m-0 text-2xl font-semibold tracking-tight text-zinc-900">Serbest düşme</h1>
          </div>
          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
            0 video · sahneden üretildi
          </span>
        </header>

        <div
          ref={playerRef}
          className={`ff-player ${cinema ? 'ff-cinema fixed inset-0 z-50 rounded-none border-0' : 'relative rounded-[24px] border border-zinc-200'} overflow-hidden bg-white shadow-[0_40px_90px_-60px_rgba(0,0,0,0.7)]`}
        >
          <style>{`
            .ff-cinema { display: flex; flex-direction: column; width: 100vw; height: 100vh; background: #faf8f1; }
            .ff-cinema .ff-body { flex: 1; min-height: 0; display: flex; flex-direction: column; }
            .ff-cinema .ff-stage { flex: 1; aspect-ratio: auto; }
            .ff-cinema .ff-stage svg { height: 100%; }
            .ff-cinema .ff-panel { top: 12px; bottom: auto; max-height: calc(100% - 24px); }
            @media (max-width: 1023px) { .ff-cinema .ff-panel { position: static; width: auto; } }
          `}</style>

          <header className="flex items-center gap-2 bg-[#6E6C22] px-3 py-2 text-[#F5F0DF]">
            <span className="text-[10px] font-bold tracking-[0.18em]">FİZİK · 11. SINIF</span>
            <span className="hidden text-[10px] opacity-50 sm:block">/</span>
            <span className="hidden text-[10px] tracking-[0.16em] opacity-80 sm:block">SERBEST DÜŞME</span>
            <nav className="ml-auto flex items-center gap-1 overflow-x-auto" aria-label="Bölümler">
              {CHAPTERS.map((entry, index) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => jump(index)}
                  aria-current={index === chapter ? 'true' : undefined}
                  className="shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold transition-colors"
                  style={{
                    background: index === chapter ? C.creme : 'rgba(255,255,255,0.10)',
                    color: index === chapter ? C.oliveDeep : C.creme,
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                  <span className="ml-1 hidden lg:inline">{entry.title}</span>
                </button>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => setCinema((value) => !value)}
              aria-label={cinema ? 'Küçült' : 'Büyüt'}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white/10 text-[#F5F0DF] hover:bg-white/20"
            >
              {cinema ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          </header>

          <div className="ff-body">
            <div className="relative">
              <div className="ff-stage aspect-video bg-[#FAF8F1]">
                <Display node={scene} width={W} height={H} title="Serbest düşme sahnesi" style={{ height: '100%' }} />
              </div>

              <div className={`ff-panel mt-2 flex flex-col gap-2.5 p-3 lg:absolute lg:right-3 lg:top-3 lg:bottom-auto lg:mt-0 lg:max-h-[calc(100%-24px)] lg:w-[248px] lg:rounded-2xl lg:border lg:border-white/70 lg:bg-white/95 lg:p-3 lg:shadow-xl lg:backdrop-blur ${chapter === 3 ? 'lg:overflow-y-auto' : 'lg:overflow-visible'}`}>
                {chapter === 3 ? (
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <p className="m-0 mb-3 text-sm font-semibold text-zinc-900">Soru</p>
                    <QuestionView
                      item={QUESTION}
                      outcome={outcome}
                      onAnswer={(response) => stage.answer('k-l', response)}
                    />
                    {outcome ? (
                      <p className="m-0 mt-3 text-xs leading-relaxed text-zinc-600">
                        {outcome.status === 'correct'
                          ? 'Doğru. L için 2v/g, K için √(2H/g); eşitleyince H = 4h.'
                          : outcome.misconceptions?.[0] ?? 'Yeniden dene; toplam süreleri eşitle.'}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2.5 rounded-2xl border border-zinc-200 bg-white p-3">
                      <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Kontroller</p>
                      {chapter !== 2 ? (
                        <Select
                          label="Yerçekimi"
                          value={g}
                          onChange={(value) => setG(value === '9.8' ? '9.8' : '10')}
                          options={[
                            { value: '10', label: '10 m/s²' },
                            { value: '9.8', label: '9,8 m/s²' },
                          ]}
                        />
                      ) : (
                        <Slider label="İlk hız" min={0} max={20} step={1} value={v0} onChange={(value) => setV0(typeof value === 'number' ? value : 0)} unit="m/s" />
                      )}
                      {chapter === 0 ? (
                        <Select
                          label="Kütle"
                          value={String(mass)}
                          onChange={(value) => setMass(typeof value === 'number' ? value : Number(value))}
                          options={[
                            { value: '5', label: '5 g' },
                            { value: '500', label: '500 g' },
                            { value: '5000', label: '5 kg' },
                          ]}
                        />
                      ) : null}
                      {chapter === 1 ? <Switch label="Hava direnci" value={air} onChange={(value) => setAir(value === true)} /> : null}
                      {chapter === 2 ? (
                        <Select
                          label="Yerçekimi"
                          value={g}
                          onChange={(value) => setG(value === '9.8' ? '9.8' : '10')}
                          options={[
                            { value: '10', label: '10 m/s²' },
                            { value: '9.8', label: '9,8 m/s²' },
                          ]}
                        />
                      ) : null}
                    </div>

                    <Readout title="Anlık değerler" rows={rows} />
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-zinc-200 bg-white px-3 py-2.5">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? 'Duraklat' : 'Oynat'}
                className="grid h-9 w-9 place-items-center rounded-full bg-zinc-900 text-white"
              >
                {playing && chapter !== 3 ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  stage.reset();
                  setPlaying(true);
                }}
                aria-label="Başa sar"
                className="grid h-8 w-8 place-items-center rounded-full border border-zinc-200 text-zinc-500"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <span className="text-[11px] tabular-nums text-zinc-500">{clock(time)}</span>
              <input
                type="range"
                min={0}
                max={FILM_END}
                step={0.01}
                value={Math.min(time, FILM_END)}
                onChange={(event) => seek(Number(event.target.value))}
                aria-label="Film zaman çizelgesi"
                className="h-1.5 min-w-20 flex-1 accent-zinc-900"
              />
              <span className="text-[11px] tabular-nums text-zinc-500">{clock(FILM_END)}</span>
              <div className="flex items-center gap-1 rounded-full border border-zinc-200 p-0.5">
                {[0.5, 1, 1.5].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setSpeed(rate)}
                    aria-pressed={speed === rate}
                    className="rounded-full px-2 py-1 text-[10px] font-semibold tabular-nums"
                    style={{ background: speed === rate ? C.olive : 'transparent', color: speed === rate ? C.creme : C.muted }}
                  >
                    {rate}×
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-zinc-500">
          Sahne Lerno <span className="text-zinc-900">Node</span> ağacından, zaman <span className="text-zinc-900">Timeline</span>'dan,
          grafikler <span className="text-zinc-900">CoordinatePlane</span>'den geliyor. Hiç video dosyası yok.
        </p>
      </div>
    </div>
  );
}
