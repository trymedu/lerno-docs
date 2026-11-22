import { z } from 'zod';
import { defineVisual, type Visual } from './types';

export const ChartParamsSchema = z
  .object({
    kind: z.enum(['bar', 'line', 'pie']).default('bar'),
    labels: z.array(z.string().min(1)).min(1),
    values: z.array(z.number()).min(1),
    durationMs: z.number().positive().default(1400),
  })
  .refine((value) => value.labels.length === value.values.length, {
    message: 'labels ve values aynı uzunlukta olmalı',
    path: ['values'],
  });

export type ChartParams = z.infer<typeof ChartParamsSchema>;

export const ChartStateSchema = z.object({
  progress: z.number(),
  kind: z.enum(['bar', 'line', 'pie']),
  labels: z.array(z.string()),
  values: z.array(z.number()),
  max: z.number(),
  total: z.number(),
});

export type ChartState = z.infer<typeof ChartStateSchema>;

/** Veri grafiği — çubuk, çizgi veya daire. */
export const chartVisual = defineVisual<ChartParams, ChartState>({
  id: 'chart',
  paramsSchema: ChartParamsSchema,
  stateSchema: ChartStateSchema,
  state: (params, timeMs) => ({
    progress: Math.max(0, Math.min(1, timeMs / params.durationMs)),
    kind: params.kind,
    labels: params.labels,
    values: params.values,
    max: Math.max(...params.values, 0),
    total: params.values.reduce((total, value) => total + Math.max(0, value), 0),
  }),
  presets: [
    {
      id: 'bar',
      label: 'Çubuk grafik',
      params: { kind: 'bar', labels: ['Mat', 'Fiz', 'Kim', 'Biy'], values: [78, 65, 82, 70], durationMs: 1400 },
    },
    {
      id: 'line',
      label: 'Çizgi grafik',
      params: { kind: 'line', labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May'], values: [12, 18, 9, 22, 30], durationMs: 1400 },
    },
    {
      id: 'pie',
      label: 'Daire grafik',
      params: { kind: 'pie', labels: ['Mat', 'Fiz', 'Kim', 'Biy'], values: [30, 20, 25, 25], durationMs: 1400 },
    },
  ],
});

export const chartVisuals: Visual[] = [chartVisual];
