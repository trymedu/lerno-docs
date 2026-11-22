import { z } from 'zod';
import { defineVisual, type Visual } from './types';

export const OrbitParamsSchema = z.object({
  star: z.string().default('Güneş'),
  bodies: z
    .array(
      z.object({
        name: z.string().min(1),
        radius: z.number().positive(),
        color: z.string().optional(),
      }),
    )
    .min(1),
  durationMs: z.number().positive().default(6000),
});

export type OrbitParams = z.infer<typeof OrbitParamsSchema>;

export const OrbitStateSchema = z.object({
  progress: z.number(),
  star: z.string(),
  maxRadius: z.number(),
  bodies: z.array(
    z.object({
      name: z.string(),
      radius: z.number(),
      color: z.string(),
      x: z.number(),
      y: z.number(),
      angle: z.number(),
    }),
  ),
});

export type OrbitState = z.infer<typeof OrbitStateSchema>;

/**
 * Orbit model whose period scales with r to the power of 1.5, following Kepler's
 * third law.
 */
export const orbitVisual = defineVisual<OrbitParams, OrbitState>({
  id: 'orbit',
  paramsSchema: OrbitParamsSchema,
  stateSchema: OrbitStateSchema,
  state: (params, timeMs) => {
    const t = Math.max(0, timeMs) / 1000;
    const bodies = params.bodies.map((body, index) => {
      const period = 4 * Math.pow(body.radius, 1.5);
      const angle = ((2 * Math.PI * t) / period) + index * 0.6;
      return {
        name: body.name,
        radius: body.radius,
        color: body.color ?? '#3B82F6',
        x: Math.cos(angle) * body.radius,
        y: Math.sin(angle) * body.radius,
        angle,
      };
    });

    return {
      progress: Math.min(1, timeMs / params.durationMs),
      star: params.star,
      maxRadius: Math.max(...params.bodies.map((body) => body.radius), 1),
      bodies,
    };
  },
  presets: [
    {
      id: 'inner',
      label: 'İç gezegenler',
      params: {
        star: 'Güneş',
        bodies: [
          { name: 'Merkür', radius: 1.4, color: '#94A3B8' },
          { name: 'Venüs', radius: 2.0, color: '#F59E0B' },
          { name: 'Dünya', radius: 2.7, color: '#3B82F6' },
          { name: 'Mars', radius: 3.4, color: '#EF4444' },
        ],
        durationMs: 8000,
      },
    },
  ],
});

export const astronomyVisuals: Visual[] = [orbitVisual];
