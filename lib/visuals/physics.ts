import { z } from 'zod';
import { defineVisual, type Visual } from './types';

const DEG = Math.PI / 180;

// ---------------------------------------------------------------------------
// pendulum — simple pendulum (small-angle approximation plus damping)
// ---------------------------------------------------------------------------

export const PendulumParamsSchema = z.object({
  length: z.number().positive().default(1.5),
  gravity: z.number().positive().default(9.8),
  initialAngleDeg: z.number().min(-90).max(90).default(30),
  damping: z.number().min(0).max(2).default(0),
  durationMs: z.number().positive().default(2000),
});

export type PendulumParams = z.infer<typeof PendulumParamsSchema>;

export const PendulumStateSchema = z.object({
  progress: z.number(),
  angle: z.number(),
  angularVelocity: z.number(),
  x: z.number(),
  y: z.number(),
  period: z.number(),
});

export type PendulumState = z.infer<typeof PendulumStateSchema>;

export const pendulumVisual = defineVisual<PendulumParams, PendulumState>({
  id: 'pendulum',
  paramsSchema: PendulumParamsSchema,
  stateSchema: PendulumStateSchema,
  state: (params, timeMs) => {
    const t = Math.max(0, timeMs) / 1000;
    const omega = Math.sqrt(params.gravity / params.length);
    const theta0 = params.initialAngleDeg * DEG;
    const decay = Math.exp(-params.damping * t);
    const angle = theta0 * Math.cos(omega * t) * decay;
    const angularVelocity = -theta0 * omega * Math.sin(omega * t) * decay;

    return {
      progress: Math.min(1, timeMs / params.durationMs),
      angle,
      angularVelocity,
      x: params.length * Math.sin(angle),
      y: -params.length * Math.cos(angle),
      period: (2 * Math.PI) / omega,
    };
  },
  presets: [
    { id: 'default', label: '1.5 m · 30°', params: { length: 1.5, gravity: 9.8, initialAngleDeg: 30, damping: 0, durationMs: 2000 } },
    { id: 'damped', label: 'Sönümlü', params: { length: 1.5, gravity: 9.8, initialAngleDeg: 40, damping: 0.4, durationMs: 3000 } },
  ],
});

// ---------------------------------------------------------------------------
// wave — ilerleyen dalga
// ---------------------------------------------------------------------------

export const WaveParamsSchema = z.object({
  amplitude: z.number().positive().default(1),
  wavelength: z.number().positive().default(Math.PI),
  frequency: z.number().positive().default(1),
  samples: z.number().int().positive().default(160),
  durationMs: z.number().positive().default(2000),
});

export type WaveParams = z.infer<typeof WaveParamsSchema>;

export const WaveStateSchema = z.object({
  progress: z.number(),
  points: z.array(z.object({ x: z.number(), y: z.number() })),
});

export type WaveState = z.infer<typeof WaveStateSchema>;

export const waveVisual = defineVisual<WaveParams, WaveState>({
  id: 'wave',
  paramsSchema: WaveParamsSchema,
  stateSchema: WaveStateSchema,
  state: (params, timeMs) => {
    const t = Math.max(0, timeMs) / 1000;
    const xMax = params.wavelength * 4;
    const points: { x: number; y: number }[] = [];
    for (let index = 0; index <= params.samples; index += 1) {
      const x = (index / params.samples) * xMax;
      const y = params.amplitude * Math.sin((2 * Math.PI * x) / params.wavelength - 2 * Math.PI * params.frequency * t);
      points.push({ x, y });
    }
    return { progress: Math.min(1, timeMs / params.durationMs), points };
  },
  presets: [
    { id: 'default', label: 'A=1 · λ=π · f=1', params: { amplitude: 1, wavelength: Math.PI, frequency: 1, samples: 160, durationMs: 2000 } },
    { id: 'short', label: 'Kısa dalga boyu', params: { amplitude: 1, wavelength: Math.PI / 2, frequency: 2, samples: 160, durationMs: 2000 } },
  ],
});

export const physicsVisuals: Visual[] = [pendulumVisual, waveVisual];
