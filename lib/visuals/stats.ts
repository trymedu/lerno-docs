import { z } from 'zod';
import { defineVisual, type Visual } from './types';

const SQRT_2PI = Math.sqrt(2 * Math.PI);

export const DistributionParamsSchema = z.object({
  mean: z.number().default(0),
  stdDev: z.number().positive().default(1),
  xMin: z.number().default(-4),
  xMax: z.number().default(4),
  samples: z.number().int().positive().default(120),
  durationMs: z.number().positive().default(1400),
});

export type DistributionParams = z.infer<typeof DistributionParamsSchema>;

export const DistributionStateSchema = z.object({
  progress: z.number(),
  mean: z.number(),
  stdDev: z.number(),
  peak: z.number(),
  points: z.array(z.object({ x: z.number(), y: z.number() })),
});

export type DistributionState = z.infer<typeof DistributionStateSchema>;

/**
 * Evaluates the normal probability density function.
 * @param x - Point on the horizontal axis.
 * @param mean - Center of the distribution.
 * @param stdDev - Standard deviation; values at or below zero return zero.
 * @returns The density at x.
 */
export function normalPdf(x: number, mean: number, stdDev: number): number {
  const z = (x - mean) / stdDev;
  return Math.exp(-0.5 * z * z) / (stdDev * SQRT_2PI);
}

export const distributionVisual = defineVisual<DistributionParams, DistributionState>({
  id: 'distribution',
  paramsSchema: DistributionParamsSchema,
  stateSchema: DistributionStateSchema,
  state: (params, timeMs) => {
    const progress = Math.max(0, Math.min(1, timeMs / params.durationMs));
    const currentMax = params.xMin + (params.xMax - params.xMin) * progress;
    const count = Math.max(2, Math.floor(params.samples * progress));
    const step = (currentMax - params.xMin) / (count - 1);

    const points: { x: number; y: number }[] = [];
    for (let index = 0; index < count; index += 1) {
      const x = params.xMin + index * step;
      points.push({ x, y: normalPdf(x, params.mean, params.stdDev) });
    }

    return {
      progress,
      mean: params.mean,
      stdDev: params.stdDev,
      peak: normalPdf(params.mean, params.mean, params.stdDev),
      points,
    };
  },
  presets: [
    { id: 'standard', label: 'Standart normal', params: { mean: 0, stdDev: 1, xMin: -4, xMax: 4, samples: 120, durationMs: 1400 } },
    { id: 'shifted', label: 'Ortalaması kaymış', params: { mean: 70, stdDev: 10, xMin: 40, xMax: 100, samples: 120, durationMs: 1400 } },
  ],
});

export const statsVisuals: Visual[] = [distributionVisual];
