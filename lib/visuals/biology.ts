import { z } from 'zod';
import { defineVisual, type Visual } from './types';

// ---------------------------------------------------------------------------
// dna — double helix
// ---------------------------------------------------------------------------

export const DnaParamsSchema = z.object({
  pairs: z.number().int().min(4).max(24).default(12),
  radius: z.number().positive().default(70),
  spacing: z.number().positive().default(26),
  durationMs: z.number().positive().default(2400),
});

export type DnaParams = z.infer<typeof DnaParamsSchema>;

export const DnaStateSchema = z.object({
  progress: z.number(),
  rungs: z.array(
    z.object({
      index: z.number().int(),
      left: z.number(),
      right: z.number(),
      y: z.number(),
      baseLeft: z.string(),
      baseRight: z.string(),
    }),
  ),
});

export type DnaState = z.infer<typeof DnaStateSchema>;

const DNA_BASES = ['A', 'T', 'G', 'C', 'T', 'A', 'C', 'G', 'G', 'C', 'A', 'T'];
const DNA_COMPLEMENT: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G' };

export const dnaVisual = defineVisual<DnaParams, DnaState>({
  id: 'dna',
  paramsSchema: DnaParamsSchema,
  stateSchema: DnaStateSchema,
  state: (params, timeMs) => {
    const progress = Math.max(0, Math.min(1, timeMs / params.durationMs));
    const phase = progress * Math.PI * 2;

    const rungs = Array.from({ length: params.pairs }, (_, index) => {
      const angle = phase + index * 0.55;
      const baseLeft = DNA_BASES[index % DNA_BASES.length];
      return {
        index,
        left: Math.sin(angle) * params.radius,
        right: -Math.sin(angle) * params.radius,
        y: index * params.spacing,
        baseLeft,
        baseRight: DNA_COMPLEMENT[baseLeft],
      };
    });

    return { progress, rungs };
  },
  presets: [
    { id: 'default', label: '12 baz çifti', params: { pairs: 12, radius: 70, spacing: 26, durationMs: 2400 } },
    { id: 'long', label: '20 baz çifti', params: { pairs: 20, radius: 70, spacing: 22, durationMs: 3200 } },
  ],
});

// ---------------------------------------------------------------------------
// punnett — genetic cross square
// ---------------------------------------------------------------------------

export const PunnettParamsSchema = z.object({
  parent1: z.string().min(2).max(2),
  parent2: z.string().min(2).max(2),
});

export type PunnettParams = z.infer<typeof PunnettParamsSchema>;

export const PunnettStateSchema = z.object({
  parent1: z.string(),
  parent2: z.string(),
  grid: z.array(z.array(z.string())),
  counts: z.record(z.string(), z.number()),
  ratio: z.string(),
});

export type PunnettState = z.infer<typeof PunnettStateSchema>;

/**
 * Builds the two-character genotype for a Punnett cell.
 * @param a - Allele from the first parent.
 * @param b - Allele from the second parent.
 * @returns The genotype with the dominant allele written first.
 */
function combineAlleles(a: string, b: string): string {
  return [a, b].sort((x, y) => (x.toLowerCase() === y.toLowerCase() ? (x < y ? -1 : 1) : x.toLowerCase() < y.toLowerCase() ? -1 : 1)).join('');
}

export const punnettVisual = defineVisual<PunnettParams, PunnettState>({
  id: 'punnett',
  paramsSchema: PunnettParamsSchema,
  stateSchema: PunnettStateSchema,
  state: (params) => {
    const a1 = params.parent1.split('');
    const a2 = params.parent2.split('');
    const grid = a1.map((first) => a2.map((second) => combineAlleles(first, second)));

    const counts: Record<string, number> = {};
    for (const row of grid) {
      for (const genotype of row) {
        counts[genotype] = (counts[genotype] ?? 0) + 1;
      }
    }

    return {
      parent1: params.parent1,
      parent2: params.parent2,
      grid,
      counts,
      ratio: Object.entries(counts)
        .map(([genotype, count]) => `${genotype}:${count}`)
        .join('  '),
    };
  },
  presets: [
    { id: 'hetero', label: 'Aa × Aa', params: { parent1: 'Aa', parent2: 'Aa' } },
    { id: 'testcross', label: 'Aa × aa', params: { parent1: 'Aa', parent2: 'aa' } },
  ],
});

// ---------------------------------------------------------------------------
// cell — cell model
// ---------------------------------------------------------------------------

export const CellParamsSchema = z.object({
  kind: z.enum(['animal', 'plant']).default('animal'),
});

export type CellParams = z.infer<typeof CellParamsSchema>;

export const CellStateSchema = z.object({
  kind: z.enum(['animal', 'plant']),
  organelles: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      x: z.number(),
      y: z.number(),
      radius: z.number(),
      color: z.string(),
    }),
  ),
});

export type CellState = z.infer<typeof CellStateSchema>;

const ORGANELLES: CellState['organelles'] = [
  { id: 'nucleus', label: 'Çekirdek', x: 0, y: 0, radius: 70, color: '#6366F1' },
  { id: 'mitochondria', label: 'Mitokondri', x: -120, y: 60, radius: 26, color: '#F59E0B' },
  { id: 'er', label: 'Endoplazmik retikulum', x: 110, y: -60, radius: 30, color: '#06B6D4' },
  { id: 'golgi', label: 'Golgi', x: 90, y: 80, radius: 24, color: '#EC4899' },
];

export const cellVisual = defineVisual<CellParams, CellState>({
  id: 'cell',
  paramsSchema: CellParamsSchema,
  stateSchema: CellStateSchema,
  state: (params) =>
    params.kind === 'plant'
      ? {
          kind: 'plant',
          organelles: [
            ...ORGANELLES,
            { id: 'chloroplast', label: 'Kloroplast', x: -100, y: -80, radius: 28, color: '#10B981' },
            { id: 'vacuole', label: 'Koful', x: 40, y: 20, radius: 90, color: 'rgba(59,130,246,0.25)' },
          ],
        }
      : { kind: 'animal', organelles: ORGANELLES },
  presets: [
    { id: 'animal', label: 'Hayvan hücresi', params: { kind: 'animal' } },
    { id: 'plant', label: 'Bitki hücresi', params: { kind: 'plant' } },
  ],
});

export const biologyVisuals: Visual[] = [dnaVisual, punnettVisual, cellVisual];
