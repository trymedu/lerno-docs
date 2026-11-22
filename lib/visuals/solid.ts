import { z } from 'zod';
import { defineVisual, type Visual } from './types';

const DEG = Math.PI / 180;
const RING_SEGMENTS = 16;

export const SolidParamsSchema = z.object({
  shape: z.enum(['cube', 'tetrahedron', 'cylinder', 'cone']).default('cube'),
  size: z.number().positive().default(1),
  spin: z.boolean().default(true),
  durationMs: z.number().positive().default(6000),
});

export type SolidParams = z.infer<typeof SolidParamsSchema>;

export const SolidStateSchema = z.object({
  progress: z.number(),
  shape: z.enum(['cube', 'tetrahedron', 'cylinder', 'cone']),
  rotation: z.number(),
  vertices: z.array(z.object({ x: z.number(), y: z.number(), z: z.number() })),
  edges: z.array(z.tuple([z.number().int(), z.number().int()])),
});

export type SolidState = z.infer<typeof SolidStateSchema>;

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Rotates a point around the x-axis.
 * @param vector - Point to rotate.
 * @param angle - Angle in radians.
 * @returns The rotated point as a new vector.
 */
function rotateX(vector: Vec3, angle: number): Vec3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: vector.x, y: vector.y * cos - vector.z * sin, z: vector.y * sin + vector.z * cos };
}

/**
 * Rotates a point around the y-axis.
 * @param vector - Point to rotate.
 * @param angle - Angle in radians.
 * @returns The rotated point as a new vector.
 */
function rotateY(vector: Vec3, angle: number): Vec3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: vector.x * cos - vector.z * sin, y: vector.y, z: vector.x * sin + vector.z * cos };
}

/**
 * Builds the wireframe of a platonic solid.
 * @param shape - Which solid to build.
 * @param size - Half-extent of the solid.
 * @returns Vertices in local space and the edges that join them.
 */
function buildGeometry(shape: SolidParams['shape'], size: number): { vertices: Vec3[]; edges: [number, number][] } {
  const half = size / 2;

  if (shape === 'cube') {
    const vertices: Vec3[] = [
      { x: -half, y: -half, z: -half },
      { x: half, y: -half, z: -half },
      { x: half, y: half, z: -half },
      { x: -half, y: half, z: -half },
      { x: -half, y: -half, z: half },
      { x: half, y: -half, z: half },
      { x: half, y: half, z: half },
      { x: -half, y: half, z: half },
    ];
    return {
      vertices,
      edges: [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ],
    };
  }

  if (shape === 'tetrahedron') {
    const vertices: Vec3[] = [
      { x: 0, y: half, z: 0 },
      { x: half, y: -half, z: half },
      { x: -half, y: -half, z: half },
      { x: 0, y: -half, z: -half },
    ];
    return {
      vertices,
      edges: [
        [0, 1], [0, 2], [0, 3],
        [1, 2], [2, 3], [3, 1],
      ],
    };
  }

  // cylinder / cone: iki halka (veya halka + tepe)
  const vertices: Vec3[] = [];
  const edges: [number, number][] = [];
  const topY = shape === 'cone' ? half : half;

  for (let index = 0; index < RING_SEGMENTS; index += 1) {
    const angle = (index / RING_SEGMENTS) * Math.PI * 2;
    vertices.push({ x: Math.cos(angle) * half, y: -half, z: Math.sin(angle) * half });
  }

  if (shape === 'cylinder') {
    for (let index = 0; index < RING_SEGMENTS; index += 1) {
      const angle = (index / RING_SEGMENTS) * Math.PI * 2;
      vertices.push({ x: Math.cos(angle) * half, y: topY, z: Math.sin(angle) * half });
    }
    for (let index = 0; index < RING_SEGMENTS; index += 1) {
      const next = (index + 1) % RING_SEGMENTS;
      edges.push([index, next]);
      edges.push([RING_SEGMENTS + index, RING_SEGMENTS + next]);
      edges.push([index, RING_SEGMENTS + index]);
    }
  } else {
    vertices.push({ x: 0, y: topY, z: 0 });
    const apex = vertices.length - 1;
    for (let index = 0; index < RING_SEGMENTS; index += 1) {
      const next = (index + 1) % RING_SEGMENTS;
      edges.push([index, next]);
      edges.push([index, apex]);
    }
  }

  return { vertices, edges };
}

/** 3B katı cisimler — bağımlılıksız tel kafes modeli. */
export const solidVisual = defineVisual<SolidParams, SolidState>({
  id: 'solid',
  paramsSchema: SolidParamsSchema,
  stateSchema: SolidStateSchema,
  state: (params, timeMs) => {
    const progress = Math.max(0, Math.min(1, timeMs / params.durationMs));
    const rotation = params.spin ? progress * Math.PI * 2 : Math.PI / 5;
    const { vertices, edges } = buildGeometry(params.shape, params.size);
    const transformed = vertices.map((vertex) => rotateY(rotateX(vertex, -25 * DEG), rotation));

    return { progress, shape: params.shape, rotation, vertices: transformed, edges };
  },
  presets: [
    { id: 'cube', label: 'Küp', params: { shape: 'cube', size: 1, spin: true, durationMs: 6000 } },
    { id: 'tetrahedron', label: 'Dört yüzlü', params: { shape: 'tetrahedron', size: 1, spin: true, durationMs: 6000 } },
    { id: 'cylinder', label: 'Silindir', params: { shape: 'cylinder', size: 1, spin: true, durationMs: 6000 } },
    { id: 'cone', label: 'Koni', params: { shape: 'cone', size: 1, spin: true, durationMs: 6000 } },
  ],
});

export const solidVisuals: Visual[] = [solidVisual];
