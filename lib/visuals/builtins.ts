import { z } from 'zod';
import { Molecule2D, ProjectileSimulation } from '@medu/lerno';
import { defineVisual, type Visual } from './types';

// ---------------------------------------------------------------------------
// projectile
// ---------------------------------------------------------------------------

export const ProjectileParamsSchema = z.object({
  v0: z.number().positive(),
  angleDeg: z.number().min(-90).max(90),
  g: z.number().positive().default(9.8),
  h0: z.number().default(0),
});

export type ProjectileParams = z.infer<typeof ProjectileParamsSchema>;

export const ProjectileStateSchema = z.object({
  t: z.number(),
  x: z.number(),
  y: z.number(),
  vx: z.number(),
  vy: z.number(),
  speed: z.number(),
  flightTime: z.number(),
  range: z.number(),
  maxHeight: z.number(),
});

export type ProjectileState = z.infer<typeof ProjectileStateSchema>;

export const projectileVisual = defineVisual<ProjectileParams, ProjectileState>({
  id: 'projectile',
  paramsSchema: ProjectileParamsSchema,
  stateSchema: ProjectileStateSchema,
  state: (params, timeMs) => {
    const shot = new ProjectileSimulation(params.v0, params.angleDeg, params.g, params.h0);
    const state = shot.getStateAtTime(Math.max(0, timeMs) / 1000);
    return {
      ...state,
      flightTime: shot.getFlightTime(),
      range: shot.getRange(),
      maxHeight: shot.getMaxHeight(),
    };
  },
  presets: [
    { id: 'classic', label: '45° · 30 m/s', params: { v0: 30, angleDeg: 45, g: 9.8, h0: 0 } },
    { id: 'steep', label: '60° · 30 m/s', params: { v0: 30, angleDeg: 60, g: 9.8, h0: 0 } },
    { id: 'flat', label: '30° · 30 m/s', params: { v0: 30, angleDeg: 30, g: 9.8, h0: 0 } },
  ],
});

// ---------------------------------------------------------------------------
// molecule
// ---------------------------------------------------------------------------

export const MoleculeParamsSchema = z.object({
  preset: z.enum(['water', 'co2', 'methane', 'ammonia']),
});

export type MoleculeParams = z.infer<typeof MoleculeParamsSchema>;

export const MoleculeStateSchema = z.object({
  name: z.string(),
  formula: z.string(),
  atoms: z.array(
    z.object({
      id: z.string(),
      symbol: z.string(),
      x: z.number(),
      y: z.number(),
      charge: z.string().optional(),
      color: z.string().optional(),
      radius: z.number().optional(),
    }),
  ),
  bonds: z.array(z.object({ fromId: z.string(), toId: z.string(), order: z.union([z.literal(1), z.literal(2), z.literal(3)]) })),
});

export type MoleculeState = z.infer<typeof MoleculeStateSchema>;

/**
 * Resolves a preset name into a molecule geometry.
 * @param params - Preset key plus optional center and scale overrides.
 * @returns The molecule ready to be drawn.
 */
function buildMolecule(params: MoleculeParams): Molecule2D {
  switch (params.preset) {
    case 'co2':
      return Molecule2D.createCarbonDioxide();
    case 'methane':
      return Molecule2D.createMethane();
    case 'ammonia':
      return Molecule2D.createAmmonia();
    case 'water':
    default:
      return Molecule2D.createWater(480, 260, 120);
  }
}

export const moleculeVisual = defineVisual<MoleculeParams, MoleculeState>({
  id: 'molecule',
  paramsSchema: MoleculeParamsSchema,
  stateSchema: MoleculeStateSchema,
  state: (params) => {
    const molecule = buildMolecule(params);
    return {
      name: molecule.name,
      formula: molecule.formula,
      atoms: molecule.atoms,
      bonds: molecule.bonds,
    };
  },
  presets: [
    { id: 'water', label: 'Su (H2O)', params: { preset: 'water' } },
    { id: 'co2', label: 'Karbondioksit (CO2)', params: { preset: 'co2' } },
    { id: 'methane', label: 'Metan (CH4)', params: { preset: 'methane' } },
    { id: 'ammonia', label: 'Amonyak (NH3)', params: { preset: 'ammonia' } },
  ],
});

// ---------------------------------------------------------------------------
// function-graph
// ---------------------------------------------------------------------------

export const FunctionGraphParamsSchema = z.object({
  preset: z.enum(['square', 'cubic', 'sine', 'reciprocal', 'sqrt', 'exp']),
  durationMs: z.number().positive().default(1600),
  samples: z.number().int().positive().default(120),
});

export type FunctionGraphParams = z.infer<typeof FunctionGraphParamsSchema>;

export const FunctionGraphStateSchema = z.object({
  progress: z.number(),
  domain: z.tuple([z.number(), z.number()]),
  yRange: z.tuple([z.number(), z.number()]),
  points: z.array(z.object({ x: z.number(), y: z.number() })),
});

export type FunctionGraphState = z.infer<typeof FunctionGraphStateSchema>;

interface GraphPreset {
  label: string;
  fn: (x: number) => number;
  domain: [number, number];
  yRange: [number, number];
}

export const FUNCTION_GRAPH_PRESETS: Record<FunctionGraphParams['preset'], GraphPreset> = {
  square: { label: 'f(x) = x²', fn: (x) => x * x, domain: [-4, 4], yRange: [-1, 10] },
  cubic: { label: 'f(x) = x³ − 3x', fn: (x) => x ** 3 - 3 * x, domain: [-3, 3], yRange: [-6, 6] },
  sine: { label: 'f(x) = sin(x)', fn: Math.sin, domain: [-2 * Math.PI, 2 * Math.PI], yRange: [-1.6, 1.6] },
  reciprocal: { label: 'f(x) = 1/x', fn: (x) => 1 / x, domain: [-4, 4], yRange: [-4, 4] },
  sqrt: { label: 'f(x) = √x', fn: Math.sqrt, domain: [0, 9], yRange: [-1, 4] },
  exp: { label: 'f(x) = eˣ', fn: Math.exp, domain: [-3, 3], yRange: [-1, 10] },
};

export const functionGraphVisual = defineVisual<FunctionGraphParams, FunctionGraphState>({
  id: 'function-graph',
  paramsSchema: FunctionGraphParamsSchema,
  stateSchema: FunctionGraphStateSchema,
  state: (params, timeMs) => {
    const preset = FUNCTION_GRAPH_PRESETS[params.preset];
    const progress = Math.max(0, Math.min(1, timeMs / params.durationMs));
    const [xStart, xEnd] = preset.domain;
    const currentEnd = xStart + (xEnd - xStart) * progress;
    const count = Math.max(2, Math.floor(params.samples * progress));
    const step = (currentEnd - xStart) / (count - 1);

    const points: { x: number; y: number }[] = [];
    for (let index = 0; index < count; index += 1) {
      const x = xStart + index * step;
      const y = preset.fn(x);
      if (Number.isFinite(y)) points.push({ x, y });
    }

    return { progress, domain: preset.domain, yRange: preset.yRange, points };
  },
  presets: (Object.keys(FUNCTION_GRAPH_PRESETS) as FunctionGraphParams['preset'][]).map((preset) => ({
    id: preset,
    label: FUNCTION_GRAPH_PRESETS[preset].label,
    params: { preset, durationMs: 1600, samples: 120 },
  })),
});

export const coreVisuals: Visual[] = [projectileVisual, moleculeVisual, functionGraphVisual];
