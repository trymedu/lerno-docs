import { z } from 'zod';
import { defineVisual, type Visual } from './types';

const DEG = Math.PI / 180;

// ---------------------------------------------------------------------------
// triangle — dynamic triangle from two sides and the included angle (SAS)
// ---------------------------------------------------------------------------

export const TriangleParamsSchema = z.object({
  sideA: z.number().positive(),
  sideB: z.number().positive(),
  angleDeg: z.number().gt(0).lt(180),
});

export type TriangleParams = z.infer<typeof TriangleParamsSchema>;

export const TriangleStateSchema = z.object({
  points: z.array(z.object({ x: z.number(), y: z.number() })),
  a: z.number(),
  b: z.number(),
  c: z.number(),
  angles: z.object({ A: z.number(), B: z.number(), C: z.number() }),
  area: z.number(),
  perimeter: z.number(),
});

export type TriangleState = z.infer<typeof TriangleStateSchema>;

export const triangleVisual = defineVisual<TriangleParams, TriangleState>({
  id: 'triangle',
  paramsSchema: TriangleParamsSchema,
  stateSchema: TriangleStateSchema,
  state: (params) => {
    const { sideA: a, sideB: b } = params;
    const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(params.angleDeg * DEG));
    const cx = (b * b + c * c - a * a) / (2 * c);
    const cy = Math.sqrt(Math.max(0, b * b - cx * cx));
    const angleA = Math.acos((b * b + c * c - a * a) / (2 * b * c)) / DEG;
    const angleB = Math.acos((a * a + c * c - b * b) / (2 * a * c)) / DEG;

    return {
      points: [
        { x: 0, y: 0 },
        { x: c, y: 0 },
        { x: cx, y: cy },
      ],
      a,
      b,
      c,
      angles: { A: angleA, B: angleB, C: params.angleDeg },
      area: 0.5 * a * b * Math.sin(params.angleDeg * DEG),
      perimeter: a + b + c,
    };
  },
  presets: [
    { id: 'right', label: 'Dik üçgen', params: { sideA: 3, sideB: 4, angleDeg: 90 } },
    { id: 'equilateral', label: 'Eşkenar', params: { sideA: 3, sideB: 3, angleDeg: 60 } },
    { id: 'acute', label: 'Dar açılı', params: { sideA: 5, sideB: 4, angleDeg: 45 } },
  ],
});

// ---------------------------------------------------------------------------
// unit-circle — unit circle and trigonometry
// ---------------------------------------------------------------------------

export const UnitCircleParamsSchema = z.object({
  angleDeg: z.number(),
});

export type UnitCircleParams = z.infer<typeof UnitCircleParamsSchema>;

export const UnitCircleStateSchema = z.object({
  angleDeg: z.number(),
  x: z.number(),
  y: z.number(),
  sin: z.number(),
  cos: z.number(),
  tan: z.number(),
});

export type UnitCircleState = z.infer<typeof UnitCircleStateSchema>;

export const unitCircleVisual = defineVisual<UnitCircleParams, UnitCircleState>({
  id: 'unit-circle',
  paramsSchema: UnitCircleParamsSchema,
  stateSchema: UnitCircleStateSchema,
  state: (params) => {
    const rad = params.angleDeg * DEG;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return {
      angleDeg: params.angleDeg,
      x: cos,
      y: sin,
      sin,
      cos,
      tan: Math.abs(cos) < 1e-9 ? Number.NaN : sin / cos,
    };
  },
  presets: [
    { id: '30', label: '30°', params: { angleDeg: 30 } },
    { id: '45', label: '45°', params: { angleDeg: 45 } },
    { id: '135', label: '135°', params: { angleDeg: 135 } },
  ],
});

export const geometryVisuals: Visual[] = [triangleVisual, unitCircleVisual];
