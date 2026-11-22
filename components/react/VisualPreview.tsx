'use client';

import { useMemo, type ReactNode } from 'react';
import { CoordinatePlane, Molecule2D } from '@medu/lerno';
import {
  BohrStateSchema,
  CellStateSchema,
  ChartStateSchema,
  ClimographStateSchema,
  DistributionStateSchema,
  DnaStateSchema,
  FunctionGraphStateSchema,
  MapCoordinatesStateSchema,
  MoleculeStateSchema,
  MorphologyStateSchema,
  OrbitStateSchema,
  PendulumStateSchema,
  ProjectileStateSchema,
  PunnettStateSchema,
  SolidStateSchema,
  SortingStateSchema,
  SyntaxTreeStateSchema,
  TriangleStateSchema,
  UnitCircleStateSchema,
  WaterCycleStateSchema,
  WaveStateSchema,
  visuals,
  type BohrState,
  type CellState,
  type ChartState,
  type ClimographState,
  type DistributionState,
  type DnaState,
  type FunctionGraphState,
  type MapCoordinatesState,
  type MorphologyState,
  type OrbitState,
  type PendulumState,
  type ProjectileState,
  type PunnettState,
  type SolidState,
  type SortingState,
  type SyntaxTreeState,
  type TriangleState,
  type UnitCircleState,
  type Visual,
  type WaterCycleState,
  type WaveState,
} from '@/lib/visuals';
import { ActionButton, CoordinateGrid, MoleculeView, Scene, controlBar, sceneColors, usePlayback } from '@medu/lerno-react';

const WIDTH = 960;
const HEIGHT = 540;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;

export interface VisualPreviewProps {
  visualId: string;
  params: Record<string, unknown>;
  title?: string;
}

const visualById = new Map(visuals.map((entry) => [entry.id, entry]));

function resolveDurationMs(visual: Visual, params: Record<string, unknown>, baseState: unknown): number {
  if (typeof params.durationMs === 'number') return params.durationMs;
  const parsed = ProjectileStateSchema.safeParse(baseState);
  if (visual.id === 'projectile' && parsed.success) return Math.max(500, parsed.data.flightTime * 1000);
  return 2000;
}

function pathFromPoints(points: { x: number; y: number }[], plane: CoordinatePlane): string {
  return points
    .map((point, index) => {
      const { px, py } = plane.toPixels(point.x, point.y);
      return `${index === 0 ? 'M' : 'L'} ${px.toFixed(2)} ${py.toFixed(2)}`;
    })
    .join(' ');
}

/** Draws a discipline visual as an animation. */
export function VisualPreview({ visualId, params, title }: VisualPreviewProps) {
  const visual = visualById.get(visualId);
  if (!visual) {
    return <p className="text-sm text-muted">{visualId} için görüntüleyici kayıtlı değil.</p>;
  }

  const baseState = useMemo(() => visual.state(params, 0), [visual, params]);
  const durationMs = resolveDurationMs(visual, params, baseState);
  const playback = usePlayback({ duration: durationMs });
  const timeMs = playback.progress * durationMs;
  const rawState = useMemo(() => visual.state(params, timeMs), [visual, params, timeMs]);

  // Static visuals have no motion to play; no playback control is rendered.
  const animated = JSON.stringify(baseState) !== JSON.stringify(visual.state(params, durationMs));

  let scene = (
    <Scene width={WIDTH} height={HEIGHT} title={title}>
      <text x={CX} y={CY} fill={sceneColors.muted} textAnchor="middle" fontSize={16}>
        {visual.id} için görüntüleyici kayıtlı değil
      </text>
    </Scene>
  );

  switch (visual.id) {
    case 'function-graph': {
      const parsed = FunctionGraphStateSchema.safeParse(rawState);
      if (parsed.success) scene = <FunctionGraphScene state={parsed.data} title={title} />;
      break;
    }
    case 'projectile': {
      const parsed = ProjectileStateSchema.safeParse(rawState);
      if (parsed.success) scene = <ProjectileScene visual={visual} params={params} state={parsed.data} title={title} />;
      break;
    }
    case 'molecule': {
      const parsed = MoleculeStateSchema.safeParse(rawState);
      if (parsed.success) {
        const molecule = new Molecule2D(parsed.data.name, parsed.data.formula, parsed.data.atoms, parsed.data.bonds);
        scene = (
          <Scene width={WIDTH} height={HEIGHT} title={title ?? `${parsed.data.name} · ${parsed.data.formula}`}>
            <MoleculeView molecule={molecule} />
          </Scene>
        );
      }
      break;
    }
    case 'dna': {
      const parsed = DnaStateSchema.safeParse(rawState);
      if (parsed.success) scene = <DnaScene state={parsed.data} title={title} />;
      break;
    }
    case 'punnett': {
      const parsed = PunnettStateSchema.safeParse(rawState);
      if (parsed.success) scene = <PunnettScene state={parsed.data} title={title} />;
      break;
    }
    case 'cell': {
      const parsed = CellStateSchema.safeParse(rawState);
      if (parsed.success) scene = <CellScene state={parsed.data} title={title} />;
      break;
    }
    case 'triangle': {
      const parsed = TriangleStateSchema.safeParse(rawState);
      if (parsed.success) scene = <TriangleScene state={parsed.data} title={title} />;
      break;
    }
    case 'unit-circle': {
      const parsed = UnitCircleStateSchema.safeParse(rawState);
      if (parsed.success) scene = <UnitCircleScene state={parsed.data} title={title} />;
      break;
    }
    case 'distribution': {
      const parsed = DistributionStateSchema.safeParse(rawState);
      if (parsed.success) scene = <DistributionScene state={parsed.data} title={title} />;
      break;
    }
    case 'pendulum': {
      const parsed = PendulumStateSchema.safeParse(rawState);
      if (parsed.success) scene = <PendulumScene state={parsed.data} title={title} />;
      break;
    }
    case 'wave': {
      const parsed = WaveStateSchema.safeParse(rawState);
      if (parsed.success) scene = <WaveScene state={parsed.data} title={title} />;
      break;
    }
    case 'sorting': {
      const parsed = SortingStateSchema.safeParse(rawState);
      if (parsed.success) scene = <SortingScene state={parsed.data} title={title} />;
      break;
    }
    case 'climograph': {
      const parsed = ClimographStateSchema.safeParse(rawState);
      if (parsed.success) scene = <ClimographScene state={parsed.data} title={title} />;
      break;
    }
    case 'morphology': {
      const parsed = MorphologyStateSchema.safeParse(rawState);
      if (parsed.success) scene = <MorphologyScene state={parsed.data} title={title} />;
      break;
    }
    case 'syntax-tree': {
      const parsed = SyntaxTreeStateSchema.safeParse(rawState);
      if (parsed.success) scene = <SyntaxTreeScene state={parsed.data} title={title} />;
      break;
    }
    case 'orbit': {
      const parsed = OrbitStateSchema.safeParse(rawState);
      if (parsed.success) scene = <OrbitScene state={parsed.data} title={title} />;
      break;
    }
    case 'bohr-atom': {
      const parsed = BohrStateSchema.safeParse(rawState);
      if (parsed.success) scene = <BohrScene state={parsed.data} title={title} />;
      break;
    }
    case 'solid': {
      const parsed = SolidStateSchema.safeParse(rawState);
      if (parsed.success) scene = <SolidScene state={parsed.data} title={title} />;
      break;
    }
    case 'map-coordinates': {
      const parsed = MapCoordinatesStateSchema.safeParse(rawState);
      if (parsed.success) scene = <MapCoordinatesScene state={parsed.data} title={title} />;
      break;
    }
    case 'water-cycle': {
      const parsed = WaterCycleStateSchema.safeParse(rawState);
      if (parsed.success) scene = <WaterCycleScene state={parsed.data} title={title} />;
      break;
    }
    case 'chart': {
      const parsed = ChartStateSchema.safeParse(rawState);
      if (parsed.success) scene = <ChartScene state={parsed.data} title={title} />;
      break;
    }
    default:
      break;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {scene}
      {animated ? (
        <div className={controlBar}>
          <ActionButton onPress={playback.play}>{playback.playing ? 'Oynatılıyor…' : 'Oynat'}</ActionButton>
          <ActionButton variant="ghost" onPress={playback.reset}>
            Baştan
          </ActionButton>
        </div>
      ) : null}
    </div>
  );
}

function FunctionGraphScene({ state, title }: { state: FunctionGraphState; title?: string }) {
  const plane = useMemo(
    () => new CoordinatePlane({ width: WIDTH, height: HEIGHT, padding: 56, xRange: state.domain, yRange: state.yRange }),
    [state.domain, state.yRange],
  );

  return (
    <Scene width={WIDTH} height={HEIGHT} title={title}>
      <CoordinateGrid plane={plane} />
      {state.points.length > 1 ? (
        <path d={pathFromPoints(state.points, plane)} fill="none" stroke={sceneColors.success} strokeWidth={3} strokeLinecap="round" />
      ) : null}
    </Scene>
  );
}

function ProjectileScene({
  visual,
  params,
  state,
  title,
}: {
  visual: Visual;
  params: Record<string, unknown>;
  state: ProjectileState;
  title?: string;
}) {
  const range = Math.max(state.range * 1.1, 10);
  const height = Math.max(state.maxHeight * 1.25, 6);

  const plane = useMemo(
    () =>
      new CoordinatePlane({
        width: WIDTH,
        height: HEIGHT,
        padding: 56,
        xRange: [0, range],
        yRange: [0, height],
        stepX: Math.max(1, Math.round(range / 10)),
        stepY: Math.max(1, Math.round(height / 6)),
      }),
    [range, height],
  );

  const trajectory = useMemo(() => {
    const samples = 80;
    const points: { x: number; y: number }[] = [];
    for (let index = 0; index <= samples; index += 1) {
      const parsed = ProjectileStateSchema.safeParse(visual.state(params, (index / samples) * state.flightTime * 1000));
      if (parsed.success) points.push({ x: parsed.data.x, y: parsed.data.y });
    }
    return pathFromPoints(points, plane);
  }, [visual, params, plane, state.flightTime]);

  const ball = plane.toPixels(state.x, state.y);

  return (
    <Scene width={WIDTH} height={HEIGHT} title={title ?? `Menzil ${state.range.toFixed(1)} m`}>
      <CoordinateGrid plane={plane} />
      <path d={trajectory} fill="none" stroke={sceneColors.success} strokeWidth={2.5} strokeDasharray="6 6" opacity={0.6} />
      <circle cx={ball.px} cy={ball.py} r={9} fill={sceneColors.accent} stroke="#ffffff" strokeWidth={2} />
    </Scene>
  );
}

const BASE_COLORS: Record<string, string> = { A: '#EF4444', T: '#3B82F6', G: '#10B981', C: '#F59E0B' };

function DnaScene({ state, title }: { state: DnaState; title?: string }) {
  const totalHeight = state.rungs.length > 0 ? state.rungs[state.rungs.length - 1].y : 0;
  const offsetY = CY - totalHeight / 2;

  return (
    <Scene width={WIDTH} height={HEIGHT} title={title ?? 'DNA çift sarmalı'}>
      {state.rungs.map((rung) => {
        const y = offsetY + rung.y;
        return (
          <g key={rung.index}>
            <line x1={CX + rung.left} y1={y} x2={CX + rung.right} y2={y} stroke={sceneColors.axis} strokeWidth={3} />
            <circle cx={CX + rung.left} cy={y} r={9} fill={BASE_COLORS[rung.baseLeft] ?? sceneColors.primary} />
            <circle cx={CX + rung.right} cy={y} r={9} fill={BASE_COLORS[rung.baseRight] ?? sceneColors.secondary} />
          </g>
        );
      })}
    </Scene>
  );
}

function PunnettScene({ state, title }: { state: PunnettState; title?: string }) {
  const cell = 84;
  const startX = CX - cell;
  const startY = CY - cell;
  const rows = state.grid.length;
  const cols = rows > 0 ? state.grid[0].length : 0;

  return (
    <Scene width={WIDTH} height={HEIGHT} title={title ?? `${state.parent1} × ${state.parent2}`}>
      {state.grid.map((row, rowIndex) =>
        row.map((genotype, colIndex) => {
          const x = startX + colIndex * cell;
          const y = startY + rowIndex * cell;
          const homozygous = genotype[0] === genotype[1];
          return (
            <g key={`${rowIndex}-${colIndex}`}>
              <rect
                x={x}
                y={y}
                width={cell}
                height={cell}
                fill={homozygous ? 'rgba(16,185,129,0.14)' : 'rgba(59,130,246,0.10)'}
                stroke={sceneColors.axis}
                strokeWidth={1.5}
              />
              <text x={x + cell / 2} y={y + cell / 2} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={700} fill={sceneColors.text}>
                {genotype}
              </text>
            </g>
          );
        }),
      )}
      {Array.from({ length: cols }, (_, colIndex) => (
        <text key={`top-${colIndex}`} x={startX + colIndex * cell + cell / 2} y={startY - 16} textAnchor="middle" fontSize={20} fontWeight={700} fill={sceneColors.accent}>
          {state.parent1[colIndex]}
        </text>
      ))}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <text key={`left-${rowIndex}`} x={startX - 20} y={startY + rowIndex * cell + cell / 2} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={700} fill={sceneColors.accent}>
          {state.parent2[rowIndex]}
        </text>
      ))}
    </Scene>
  );
}

function CellScene({ state, title }: { state: CellState; title?: string }) {
  const membrane = state.kind === 'plant' ? { fill: 'rgba(16,185,129,0.10)', stroke: '#10B981' } : { fill: 'rgba(59,130,246,0.10)', stroke: '#3B82F6' };

  return (
    <Scene width={WIDTH} height={HEIGHT} title={title ?? (state.kind === 'plant' ? 'Bitki hücresi' : 'Hayvan hücresi')}>
      {state.kind === 'plant' ? (
        <rect x={CX - 190} y={CY - 150} width={380} height={300} rx={20} fill={membrane.fill} stroke={membrane.stroke} strokeWidth={3} />
      ) : (
        <circle cx={CX} cy={CY} r={165} fill={membrane.fill} stroke={membrane.stroke} strokeWidth={3} />
      )}
      {state.organelles.map((organelle) => (
        <g key={organelle.id}>
          <circle cx={CX + organelle.x} cy={CY + organelle.y} r={organelle.radius} fill={organelle.color} opacity={0.85} />
          <text x={CX + organelle.x} y={CY + organelle.y + organelle.radius + 16} textAnchor="middle" fontSize={13} fill={sceneColors.muted}>
            {organelle.label}
          </text>
        </g>
      ))}
    </Scene>
  );
}

function TriangleScene({ state, title }: { state: TriangleState; title?: string }) {
  const maxX = Math.max(...state.points.map((point) => point.x), 1) * 1.2;
  const maxY = Math.max(...state.points.map((point) => point.y), 1) * 1.2;

  const plane = useMemo(
    () => new CoordinatePlane({ width: WIDTH, height: HEIGHT, padding: 70, xRange: [0, maxX], yRange: [0, maxY] }),
    [maxX, maxY],
  );

  const poly = state.points.map((point) => `${plane.toPixels(point.x, point.y).px.toFixed(2)},${plane.toPixels(point.x, point.y).py.toFixed(2)}`).join(' ');

  return (
    <Scene width={WIDTH} height={HEIGHT} title={title ?? `Alan ${state.area.toFixed(2)}`}>
      <CoordinateGrid plane={plane} showLabels={false} />
      <polygon points={poly} fill="rgba(59,130,246,0.16)" stroke={sceneColors.primary} strokeWidth={3} />
      {state.points.map((point, index) => {
        const { px, py } = plane.toPixels(point.x, point.y);
        return <circle key={index} cx={px} cy={py} r={5} fill={sceneColors.accent} />;
      })}
      <text x={CX} y={HEIGHT - 24} textAnchor="middle" fontSize={15} fill={sceneColors.muted}>
        a={state.a} · b={state.b} · c={state.c.toFixed(2)} · Çevre={state.perimeter.toFixed(2)} · Alan={state.area.toFixed(2)}
      </text>
    </Scene>
  );
}

function UnitCircleScene({ state, title }: { state: UnitCircleState; title?: string }) {
  const plane = useMemo(
    () => new CoordinatePlane({ width: WIDTH, height: HEIGHT, padding: 90, xRange: [-1.6, 1.6], yRange: [-1.6, 1.6], stepX: 0.5, stepY: 0.5 }),
    [],
  );

  const origin = plane.toPixels(0, 0);
  const point = plane.toPixels(state.x, state.y);
  const radiusPx = plane.toPixels(1, 0).px - origin.px;

  return (
    <Scene width={WIDTH} height={HEIGHT} title={title ?? `${state.angleDeg}°`}>
      <CoordinateGrid plane={plane} />
      <circle cx={origin.px} cy={origin.py} r={radiusPx} fill="none" stroke={sceneColors.axis} strokeWidth={2} />
      <line x1={origin.px} y1={origin.py} x2={point.px} y2={point.py} stroke={sceneColors.primary} strokeWidth={3} />
      <line x1={point.px} y1={point.py} x2={point.px} y2={origin.py} stroke={sceneColors.success} strokeWidth={2} strokeDasharray="4 4" />
      <line x1={point.px} y1={point.py} x2={origin.px} y2={point.py} stroke={sceneColors.accent} strokeWidth={2} strokeDasharray="4 4" />
      <circle cx={point.px} cy={point.py} r={7} fill={sceneColors.accent} />
      <text x={CX} y={HEIGHT - 24} textAnchor="middle" fontSize={15} fill={sceneColors.muted}>
        sin={state.sin.toFixed(3)} · cos={state.cos.toFixed(3)} · tan={Number.isNaN(state.tan) ? 'tanımsız' : state.tan.toFixed(3)}
      </text>
    </Scene>
  );
}

function DistributionScene({ state, title }: { state: DistributionState; title?: string }) {
  const maxX = Math.max(...state.points.map((point) => point.x), 1);
  const minX = Math.min(...state.points.map((point) => point.x), -1);

  const plane = useMemo(
    () => new CoordinatePlane({ width: WIDTH, height: HEIGHT, padding: 56, xRange: [minX, maxX], yRange: [0, state.peak * 1.2] }),
    [minX, maxX, state.peak],
  );

  const curve = pathFromPoints(state.points, plane);
  const area = state.points.length > 1 ? `${curve} L ${plane.toPixels(state.points[state.points.length - 1].x, 0).px} ${plane.toPixels(state.points[state.points.length - 1].x, 0).py} L ${plane.toPixels(state.points[0].x, 0).px} ${plane.toPixels(state.points[0].x, 0).py} Z` : '';

  return (
    <Scene width={WIDTH} height={HEIGHT} title={title ?? `μ=${state.mean} · σ=${state.stdDev}`}>
      <CoordinateGrid plane={plane} />
      {area ? <path d={area} fill="rgba(59,130,246,0.20)" stroke="none" /> : null}
      {curve ? <path d={curve} fill="none" stroke={sceneColors.primary} strokeWidth={3} /> : null}
    </Scene>
  );
}

function PendulumScene({ state, title }: { state: PendulumState; title?: string }) {
  const pivotX = CX;
  const pivotY = 90;
  const scale = 120;
  const bobX = pivotX + state.x * scale;
  const bobY = pivotY - state.y * scale;

  return (
    <Scene width={WIDTH} height={HEIGHT} title={title ?? `T=${state.period.toFixed(2)} s`}>
      <line x1={pivotX} y1={pivotY} x2={bobX} y2={bobY} stroke={sceneColors.axis} strokeWidth={3} />
      <circle cx={pivotX} cy={pivotY} r={8} fill={sceneColors.muted} />
      <circle cx={bobX} cy={bobY} r={22} fill={sceneColors.accent} stroke="#ffffff" strokeWidth={2} />
      <text x={CX} y={HEIGHT - 30} textAnchor="middle" fontSize={15} fill={sceneColors.muted}>
        Açı={((state.angle * 180) / Math.PI).toFixed(1)}° · Periyot={state.period.toFixed(2)} s
      </text>
    </Scene>
  );
}

function WaveScene({ state, title }: { state: WaveState; title?: string }) {
  const maxX = Math.max(...state.points.map((point) => point.x), 1);
  const amplitude = Math.max(...state.points.map((point) => Math.abs(point.y)), 1) * 1.2;

  const plane = useMemo(
    () => new CoordinatePlane({ width: WIDTH, height: HEIGHT, padding: 56, xRange: [0, maxX], yRange: [-amplitude, amplitude] }),
    [maxX, amplitude],
  );

  return (
    <Scene width={WIDTH} height={HEIGHT} title={title ?? 'İlerleyen dalga'}>
      <CoordinateGrid plane={plane} />
      <path d={pathFromPoints(state.points, plane)} fill="none" stroke={sceneColors.cyan} strokeWidth={3} />
    </Scene>
  );
}

function SortingScene({ state, title }: { state: SortingState; title?: string }) {
  const count = state.values.length;
  const maxValue = Math.max(...state.values, 1);
  const gap = 12;
  const usableWidth = WIDTH - 120;
  const barWidth = (usableWidth - gap * (count - 1)) / count;
  const baseline = HEIGHT - 90;
  const maxHeight = HEIGHT - 200;

  return (
    <Scene width={WIDTH} height={HEIGHT} title={title ?? `${state.algorithm} · adım ${state.step + 1}/${state.totalSteps}`}>
      {state.values.map((value, index) => {
        const height = (value / maxValue) * maxHeight;
        const x = 60 + index * (barWidth + gap);
        const isCompared = state.compare !== null && (state.compare[0] === index || state.compare[1] === index);
        const isSorted = index >= count - state.sortedCount;
        return (
          <g key={index}>
            <rect
              x={x}
              y={baseline - height}
              width={barWidth}
              height={height}
              rx={6}
              fill={isCompared ? sceneColors.accent : isSorted ? sceneColors.success : sceneColors.primary}
            />
            <text x={x + barWidth / 2} y={baseline + 22} textAnchor="middle" fontSize={15} fill={sceneColors.muted}>
              {value}
            </text>
          </g>
        );
      })}
    </Scene>
  );
}

function ClimographScene({ state, title }: { state: ClimographState; title?: string }) {
  const left = 70;
  const right = WIDTH - 70;
  const top = 60;
  const bottom = HEIGHT - 80;
  const step = (right - left) / state.months.length;
  const maxTemp = Math.max(state.maxTemp, 1);
  const minTemp = Math.min(state.minTemp, 0);
  const tempSpan = Math.max(maxTemp - minTemp, 1);
  const visible = Math.max(1, Math.ceil(state.progress * state.months.length));

  const tempY = (value: number): number => bottom - ((value - minTemp) / tempSpan) * (bottom - top);
  const precipHeight = (value: number): number => (value / Math.max(state.maxPrecip, 1)) * (bottom - top) * 0.55;

  const line = state.temperatures
    .slice(0, visible)
    .map((value, index) => `${index === 0 ? 'M' : 'L'} ${left + step * index + step / 2} ${tempY(value)}`)
    .join(' ');

  return (
    <Scene width={WIDTH} height={HEIGHT} title={title ?? state.city}>
      <line x1={left} y1={bottom} x2={right} y2={bottom} stroke={sceneColors.axis} strokeWidth={2} />
      {state.precipitation.slice(0, visible).map((value, index) => {
        const height = precipHeight(value);
        return (
          <rect
            key={index}
            x={left + step * index + step * 0.2}
            y={bottom - height}
            width={step * 0.6}
            height={height}
            rx={4}
            fill={sceneColors.primary}
            opacity={0.55}
          />
        );
      })}
      <path d={line} fill="none" stroke={sceneColors.danger} strokeWidth={3} strokeLinecap="round" />
      {state.temperatures.slice(0, visible).map((value, index) => (
        <circle key={index} cx={left + step * index + step / 2} cy={tempY(value)} r={5} fill={sceneColors.danger} />
      ))}
      {state.months.map((month, index) => (
        <text key={month} x={left + step * index + step / 2} y={bottom + 24} textAnchor="middle" fontSize={13} fill={sceneColors.muted}>
          {month}
        </text>
      ))}
      <text x={left} y={top - 16} fontSize={13} fill={sceneColors.danger}>
        Sıcaklık (°C)
      </text>
      <text x={right} y={top - 16} textAnchor="end" fontSize={13} fill={sceneColors.primary}>
        Yağış (mm)
      </text>
    </Scene>
  );
}

const MORPHOLOGY_COLORS: Record<string, string> = {
  root: sceneColors.primary,
  derivation: sceneColors.accent,
  inflection: sceneColors.secondary,
};

const MORPHOLOGY_LABELS: Record<string, string> = {
  root: 'kök',
  derivation: 'yapım eki',
  inflection: 'çekim eki',
};

function MorphologyScene({ state, title }: { state: MorphologyState; title?: string }) {
  const totalChars = state.parts.reduce((total, part) => total + part.text.length, 0) || 1;
  const usable = WIDTH - 160;
  let cursor = 80;

  return (
    <Scene width={WIDTH} height={HEIGHT} title={title ?? state.word}>
      {state.parts.map((part, index) => {
        const width = (part.text.length / totalChars) * usable;
        const x = cursor;
        cursor += width;
        return (
          <g key={index}>
            <rect x={x} y={CY - 40} width={width - 6} height={80} rx={10} fill={MORPHOLOGY_COLORS[part.type]} opacity={0.85} />
            <text x={x + (width - 6) / 2} y={CY - 2} textAnchor="middle" fontSize={26} fontWeight={700} fill="#ffffff">
              {part.text}
            </text>
            <text x={x + (width - 6) / 2} y={CY + 70} textAnchor="middle" fontSize={13} fill={sceneColors.muted}>
              {MORPHOLOGY_LABELS[part.type]}
            </text>
          </g>
        );
      })}
      {state.meaning ? (
        <text x={CX} y={HEIGHT - 40} textAnchor="middle" fontSize={14} fill={sceneColors.muted}>
          {state.meaning}
        </text>
      ) : null}
    </Scene>
  );
}

function SyntaxTreeScene({ state, title }: { state: SyntaxTreeState; title?: string }) {
  const padding = 70;
  const scale = Math.min((WIDTH - padding * 2) / Math.max(state.width, 1), (HEIGHT - padding * 2) / Math.max(state.height, 1), 1.4);
  const offsetX = padding + (WIDTH - padding * 2 - state.width * scale) / 2;
  const offsetY = padding + (HEIGHT - padding * 2 - state.height * scale) / 2;
  const byId = new Map(state.nodes.map((node) => [node.id, node]));
  const pos = (id: string): { x: number; y: number } => {
    const node = byId.get(id);
    return { x: offsetX + (node?.x ?? 0) * scale, y: offsetY + (node?.y ?? 0) * scale };
  };

  return (
    <Scene width={WIDTH} height={HEIGHT} title={title ?? state.sentence}>
      {state.edges.map((edge, index) => {
        const from = pos(edge.from);
        const to = pos(edge.to);
        return <line key={index} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={sceneColors.axis} strokeWidth={2} />;
      })}
      {state.nodes.map((node) => {
        const x = offsetX + node.x * scale;
        const y = offsetY + node.y * scale;
        const width = node.label.length * 9 + 24;
        return (
          <g key={node.id}>
            <rect x={x - width / 2} y={y - 18} width={width} height={36} rx={10} fill={sceneColors.surface} stroke={sceneColors.primary} />
            <text x={x} y={y + 6} textAnchor="middle" fontSize={16} fill={sceneColors.text}>
              {node.label}
            </text>
            {node.role ? (
              <text x={x} y={y + 40} textAnchor="middle" fontSize={12} fill={sceneColors.accent}>
                {node.role}
              </text>
            ) : null}
          </g>
        );
      })}
    </Scene>
  );
}

function OrbitScene({ state, title }: { state: OrbitState; title?: string }) {
  const scale = (Math.min(WIDTH, HEIGHT) / 2 - 70) / Math.max(state.maxRadius, 1);

  return (
    <Scene width={WIDTH} height={HEIGHT} title={title ?? state.star}>
      {state.bodies.map((body) => (
        <circle key={`orbit-${body.name}`} cx={CX} cy={CY} r={body.radius * scale} fill="none" stroke={sceneColors.grid} strokeWidth={1.5} />
      ))}
      <circle cx={CX} cy={CY} r={22} fill={sceneColors.accent} />
      <text x={CX} y={CY + 44} textAnchor="middle" fontSize={12} fill={sceneColors.muted}>
        {state.star}
      </text>
      {state.bodies.map((body) => (
        <g key={body.name}>
          <circle cx={CX + body.x * scale} cy={CY + body.y * scale} r={9} fill={body.color} />
          <text x={CX + body.x * scale} y={CY + body.y * scale - 16} textAnchor="middle" fontSize={12} fill={sceneColors.muted}>
            {body.name}
          </text>
        </g>
      ))}
    </Scene>
  );
}

function BohrScene({ state, title }: { state: BohrState; title?: string }) {
  const shells: ReactNode[] = [];

  state.shells.forEach((electrons, shellIndex) => {
    const radius = 60 + shellIndex * 52;
    shells.push(<circle key={`shell-${shellIndex}`} cx={CX} cy={CY} r={radius} fill="none" stroke={sceneColors.grid} strokeWidth={1.5} />);
    for (let index = 0; index < electrons; index += 1) {
      const angle = (index / electrons) * Math.PI * 2 + shellIndex * 0.4;
      shells.push(
        <circle key={`e-${shellIndex}-${index}`} cx={CX + Math.cos(angle) * radius} cy={CY + Math.sin(angle) * radius} r={6} fill={sceneColors.primary} />,
      );
    }
  });

  return (
    <Scene width={WIDTH} height={HEIGHT} title={title ?? `${state.name} (${state.symbol})`}>
      {shells}
      <circle cx={CX} cy={CY} r={30} fill={sceneColors.danger} />
      <text x={CX} y={CY + 7} textAnchor="middle" fontSize={22} fontWeight={700} fill="#ffffff">
        {state.symbol}
      </text>
      <text x={CX} y={HEIGHT - 30} textAnchor="middle" fontSize={14} fill={sceneColors.muted}>
        {state.name} · Z = {state.atomicNumber} · Katmanlar: {state.shells.join(' / ')}
      </text>
    </Scene>
  );
}

function SolidScene({ state, title }: { state: SolidState; title?: string }) {
  const scale = 190;
  const project = (vertex: { x: number; y: number; z: number }) => ({ x: CX + vertex.x * scale, y: CY + vertex.y * scale });

  const ordered = [...state.edges].sort((a, b) => {
    const depthA = (state.vertices[a[0]].z + state.vertices[a[1]].z) / 2;
    const depthB = (state.vertices[b[0]].z + state.vertices[b[1]].z) / 2;
    return depthA - depthB;
  });

  return (
    <Scene width={WIDTH} height={HEIGHT} title={title ?? state.shape}>
      {ordered.map((edge, index) => {
        const from = project(state.vertices[edge[0]]);
        const to = project(state.vertices[edge[1]]);
        const depth = (state.vertices[edge[0]].z + state.vertices[edge[1]].z) / 2;
        const opacity = 0.35 + ((depth + 1) / 2) * 0.65;
        return (
          <line key={index} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={sceneColors.primary} strokeWidth={2.5} opacity={opacity} />
        );
      })}
    </Scene>
  );
}

function MapCoordinatesScene({ state, title }: { state: MapCoordinatesState; title?: string }) {
  const margin = 60;
  const mapWidth = WIDTH - margin * 2;
  const mapHeight = HEIGHT - margin * 2;
  const x = (normalized: number): number => margin + normalized * mapWidth;
  const y = (normalized: number): number => margin + normalized * mapHeight;

  return (
    <Scene width={WIDTH} height={HEIGHT} title={title ?? 'Koordinat haritası'}>
      <rect x={margin} y={margin} width={mapWidth} height={mapHeight} fill={sceneColors.surfaceSoft} stroke={sceneColors.axis} strokeWidth={2} />
      {state.graticule.longs.map((lon) => (
        <line key={`lon-${lon}`} x1={x((lon + 180) / 360)} y1={margin} x2={x((lon + 180) / 360)} y2={margin + mapHeight} stroke={lon === 0 ? sceneColors.accent : sceneColors.grid} strokeWidth={lon === 0 ? 2 : 1} strokeDasharray="4 4" />
      ))}
      {state.graticule.lats.map((lat) => (
        <line key={`lat-${lat}`} x1={margin} y1={y((90 - lat) / 180)} x2={margin + mapWidth} y2={y((90 - lat) / 180)} stroke={lat === 0 ? sceneColors.accent : sceneColors.grid} strokeWidth={lat === 0 ? 2 : 1} strokeDasharray="4 4" />
      ))}
      {state.markers.map((marker) => (
        <g key={marker.name} opacity={state.progress > 0 ? 1 : 0}>
          <circle cx={x(marker.x)} cy={y(marker.y)} r={9} fill={marker.color} stroke="#ffffff" strokeWidth={2} />
          <text x={x(marker.x) + 14} y={y(marker.y) + 5} fontSize={14} fill={sceneColors.text}>
            {marker.name}
          </text>
        </g>
      ))}
      <text x={margin} y={margin - 14} fontSize={12} fill={sceneColors.muted}>
        Ekvator ve başlangıç meridyeni vurgulanır; işaretçiler enlem/boylama göre konumlanır.
      </text>
    </Scene>
  );
}

function WaterCycleScene({ state, title }: { state: WaterCycleState; title?: string }) {
  const margin = 90;
  const width = WIDTH - margin * 2;
  const height = HEIGHT - margin * 2;
  const pos = (id: string): { x: number; y: number } => {
    const stage = state.stages.find((entry) => entry.id === id);
    return { x: margin + (stage?.x ?? 0.5) * width, y: margin + (stage?.y ?? 0.5) * height };
  };

  const scaled = state.progress * state.flows.length;
  const flowIndex = Math.min(state.flows.length - 1, Math.floor(scaled));
  const t = Math.min(1, scaled - flowIndex);
  const activeFlow = state.flows[flowIndex];
  const from = pos(activeFlow.from);
  const to = pos(activeFlow.to);
  const droplet = { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };

  return (
    <Scene width={WIDTH} height={HEIGHT} title={title ?? 'Su döngüsü'}>
      {state.flows.map((flow) => {
        const a = pos(flow.from);
        const b = pos(flow.to);
        return <line key={`${flow.from}-${flow.to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={sceneColors.grid} strokeWidth={2} strokeDasharray="6 6" />;
      })}
      {state.stages.map((stage) => (
        <g key={stage.id}>
          <circle cx={pos(stage.id).x} cy={pos(stage.id).y} r={16} fill={sceneColors.primary} />
          <text x={pos(stage.id).x} y={pos(stage.id).y + 38} textAnchor="middle" fontSize={14} fill={sceneColors.text}>
            {stage.label}
          </text>
        </g>
      ))}
      <circle cx={droplet.x} cy={droplet.y} r={8} fill={sceneColors.cyan} stroke="#ffffff" strokeWidth={2} />
    </Scene>
  );
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

function ChartScene({ state, title }: { state: ChartState; title?: string }) {
  const left = 80;
  const right = WIDTH - 80;
  const top = 70;
  const bottom = HEIGHT - 80;
  const count = state.values.length;
  const visible = Math.max(1, Math.ceil(state.progress * count));
  const maxValue = Math.max(state.max, 1);

  if (state.kind === 'pie') {
    const radius = 160;
    const total = Math.max(state.total, 1);
    let angle = -Math.PI / 2;
    return (
      <Scene width={WIDTH} height={HEIGHT} title={title ?? 'Daire grafik'}>
        {state.values.map((value, index) => {
          const sweep = (value / total) * Math.PI * 2;
          const start = angle;
          const end = angle + sweep;
          angle = end;
          const x1 = CX + radius * Math.cos(start);
          const y1 = CY + radius * Math.sin(start);
          const x2 = CX + radius * Math.cos(end);
          const y2 = CY + radius * Math.sin(end);
          const largeArc = sweep > Math.PI ? 1 : 0;
          return (
            <path
              key={index}
              d={`M ${CX} ${CY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              opacity={index < visible ? 0.9 : 0.2}
            />
          );
        })}
        {state.labels.map((label, index) => (
          <text key={label} x={right - index * 0} y={top + index * 24} textAnchor="end" fontSize={14} fill={CHART_COLORS[index % CHART_COLORS.length]}>
            {label} — {state.values[index]}
          </text>
        ))}
      </Scene>
    );
  }

  if (state.kind === 'line') {
    const step = (right - left) / Math.max(count - 1, 1);
    const line = state.values
      .slice(0, visible)
      .map((value, index) => `${index === 0 ? 'M' : 'L'} ${left + index * step} ${bottom - (value / maxValue) * (bottom - top)}`)
      .join(' ');
    return (
      <Scene width={WIDTH} height={HEIGHT} title={title ?? 'Çizgi grafik'}>
        <line x1={left} y1={bottom} x2={right} y2={bottom} stroke={sceneColors.axis} strokeWidth={2} />
        <path d={line} fill="none" stroke={sceneColors.primary} strokeWidth={3} strokeLinecap="round" />
        {state.values.slice(0, visible).map((value, index) => (
          <g key={index}>
            <circle cx={left + index * step} cy={bottom - (value / maxValue) * (bottom - top)} r={5} fill={sceneColors.accent} />
            <text x={left + index * step} y={bottom + 24} textAnchor="middle" fontSize={13} fill={sceneColors.muted}>
              {state.labels[index]}
            </text>
          </g>
        ))}
      </Scene>
    );
  }

  const step = (right - left) / count;
  return (
    <Scene width={WIDTH} height={HEIGHT} title={title ?? 'Çubuk grafik'}>
      <line x1={left} y1={bottom} x2={right} y2={bottom} stroke={sceneColors.axis} strokeWidth={2} />
      {state.values.slice(0, visible).map((value, index) => {
        const barHeight = (value / maxValue) * (bottom - top);
        return (
          <g key={index}>
            <rect x={left + step * index + step * 0.2} y={bottom - barHeight} width={step * 0.6} height={barHeight} rx={6} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            <text x={left + step * index + step * 0.5} y={bottom + 24} textAnchor="middle" fontSize={13} fill={sceneColors.muted}>
              {state.labels[index]}
            </text>
            <text x={left + step * index + step * 0.5} y={bottom - barHeight - 10} textAnchor="middle" fontSize={13} fill={sceneColors.text}>
              {value}
            </text>
          </g>
        );
      })}
    </Scene>
  );
}
