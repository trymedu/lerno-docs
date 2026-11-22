import { z } from 'zod';
import { defineVisual, type Visual } from './types';

export const SortingParamsSchema = z.object({
  algorithm: z.enum(['bubble', 'selection', 'insertion']).default('bubble'),
  values: z.array(z.number()).min(2).max(20),
  durationMs: z.number().positive().default(2400),
});

export type SortingParams = z.infer<typeof SortingParamsSchema>;

export const SortingStateSchema = z.object({
  progress: z.number(),
  algorithm: z.enum(['bubble', 'selection', 'insertion']),
  values: z.array(z.number()),
  compare: z.tuple([z.number(), z.number()]).nullable(),
  sortedCount: z.number().int(),
  step: z.number().int(),
  totalSteps: z.number().int(),
});

export type SortingState = z.infer<typeof SortingStateSchema>;

interface SortStep {
  values: number[];
  compare: [number, number] | null;
  sortedCount: number;
}

/**
 * Records every comparison and swap of bubble sort.
 * @param input - Values to sort; the input is not mutated.
 * @returns One step per comparison, ready to animate frame by frame.
 */
function bubbleSteps(input: number[]): SortStep[] {
  const values = [...input];
  const steps: SortStep[] = [];
  let sortedCount = 0;
  for (let i = 0; i < values.length - 1; i += 1) {
    for (let j = 0; j < values.length - 1 - i; j += 1) {
      steps.push({ values: [...values], compare: [j, j + 1], sortedCount });
      if (values[j] > values[j + 1]) {
        [values[j], values[j + 1]] = [values[j + 1], values[j]];
        steps.push({ values: [...values], compare: [j, j + 1], sortedCount });
      }
    }
    sortedCount += 1;
  }
  steps.push({ values: [...values], compare: null, sortedCount: values.length });
  return steps;
}

/**
 * Records every comparison and swap of selection sort.
 * @param input - Values to sort; the input is not mutated.
 * @returns One step per comparison, ready to animate frame by frame.
 */
function selectionSteps(input: number[]): SortStep[] {
  const values = [...input];
  const steps: SortStep[] = [];
  for (let i = 0; i < values.length - 1; i += 1) {
    let min = i;
    for (let j = i + 1; j < values.length; j += 1) {
      steps.push({ values: [...values], compare: [min, j], sortedCount: i });
      if (values[j] < values[min]) min = j;
    }
    if (min !== i) {
      [values[i], values[min]] = [values[min], values[i]];
      steps.push({ values: [...values], compare: [i, min], sortedCount: i });
    }
  }
  steps.push({ values: [...values], compare: null, sortedCount: values.length });
  return steps;
}

/**
 * Records every comparison and move of insertion sort.
 * @param input - Values to sort; the input is not mutated.
 * @returns One step per comparison, ready to animate frame by frame.
 */
function insertionSteps(input: number[]): SortStep[] {
  const values = [...input];
  const steps: SortStep[] = [];
  for (let i = 1; i < values.length; i += 1) {
    let j = i;
    while (j > 0 && values[j - 1] > values[j]) {
      steps.push({ values: [...values], compare: [j - 1, j], sortedCount: i });
      [values[j - 1], values[j]] = [values[j], values[j - 1]];
      steps.push({ values: [...values], compare: [j - 1, j], sortedCount: i });
      j -= 1;
    }
    steps.push({ values: [...values], compare: null, sortedCount: i + 1 });
  }
  steps.push({ values: [...values], compare: null, sortedCount: values.length });
  return steps;
}

/**
 * Selects a sort implementation from the requested algorithm name.
 * @param params - Algorithm name, values, and timing.
 * @returns The steps of the requested algorithm; unknown names fall back to bubble sort.
 */
function stepsFor(params: SortingParams): SortStep[] {
  switch (params.algorithm) {
    case 'selection':
      return selectionSteps(params.values);
    case 'insertion':
      return insertionSteps(params.values);
    case 'bubble':
    default:
      return bubbleSteps(params.values);
  }
}

export const sortingVisual = defineVisual<SortingParams, SortingState>({
  id: 'sorting',
  paramsSchema: SortingParamsSchema,
  stateSchema: SortingStateSchema,
  state: (params, timeMs) => {
    const steps = stepsFor(params);
    const progress = Math.max(0, Math.min(1, timeMs / params.durationMs));
    const index = Math.min(steps.length - 1, Math.floor(progress * steps.length));
    const current = steps[index];

    return {
      progress,
      algorithm: params.algorithm,
      values: current.values,
      compare: current.compare,
      sortedCount: current.sortedCount,
      step: index,
      totalSteps: steps.length,
    };
  },
  presets: [
    { id: 'bubble', label: 'Bubble sort', params: { algorithm: 'bubble', values: [5, 2, 9, 1, 6, 3], durationMs: 2400 } },
    { id: 'selection', label: 'Selection sort', params: { algorithm: 'selection', values: [5, 2, 9, 1, 6, 3], durationMs: 2400 } },
    { id: 'insertion', label: 'Insertion sort', params: { algorithm: 'insertion', values: [5, 2, 9, 1, 6, 3], durationMs: 2400 } },
  ],
});

export const csVisuals: Visual[] = [sortingVisual];
